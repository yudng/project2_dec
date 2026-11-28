package com.jackoup.inventory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThan;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class SecurityAndIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String loginAndGetToken(String username, String password) throws Exception {
        String body = objectMapper.writeValueAsString(new LoginPayload(username, password));
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(res.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    private record LoginPayload(String username, String password) {}

    @Test
    void dp01_loginAndRbacPermissions() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());

        String staffToken = loginAndGetToken("staff", "staff123");
        String adminToken = loginAndGetToken("admin", "admin123");

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STAFF"));

        mockMvc.perform(get("/api/products").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/audit-logs").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/audit-logs").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void hc01_skuNormalizationAndDuplicateRejection() throws Exception {
        String adminToken = loginAndGetToken("admin", "admin123");

        String duplicateBody = """
                {"sku":"  sku-1001  ","name":"Dup Mouse","category":"Electronics",
                 "quantity":5,"price":10.00,"lowStockThreshold":2}""";
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateBody))
                .andExpect(status().isConflict());

        String validBody = """
                {"sku":"  sku-new-99  ","name":"New Device","category":"Electronics",
                 "quantity":0,"price":15.00,"lowStockThreshold":0}""";
        MvcResult createdRes = mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("SKU-NEW-99"))
                .andReturn();

        JsonNode created = objectMapper.readTree(createdRes.getResponse().getContentAsString());
        long id = created.get("id").asLong();

        // HC-03: verify outOfStockCount increments when qty=0 (even with threshold=0)
        mockMvc.perform(get("/api/products/stats").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outOfStockCount").value(1))
                .andExpect(jsonPath("$.lowStockCount").value(3));

        // Update same product keeping lowercase version of same SKU succeeds
        String updateSameSku = """
                {"sku":"sku-new-99","name":"Updated Device","category":"Electronics",
                 "quantity":999,"price":18.00,"lowStockThreshold":2,"version":0}""";
        mockMvc.perform(put("/api/products/" + id)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateSameSku))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU-NEW-99"))
                .andExpect(jsonPath("$.quantity").value(0));
    }

    @Test
    void ht01_and_ht02_exportCsvAndSortByValue() throws Exception {
        String staffToken = loginAndGetToken("staff", "staff123");

        // Sort by derived column "value" descending (120 * 12.99 = 1558.80 vs 15 * 329.99 = 4949.85, etc.)
        MvcResult sortRes = mockMvc.perform(get("/api/products?sort=value,desc&size=20")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode content = objectMapper.readTree(sortRes.getResponse().getContentAsString()).get("content");
        double firstVal = content.get(0).get("quantity").asDouble() * content.get(0).get("price").asDouble();
        double lastVal = content.get(content.size() - 1).get("quantity").asDouble()
                * content.get(content.size() - 1).get("price").asDouble();
        assertTrue(firstVal >= lastVal);

        // Invalid sort field returns 400 Bad Request (never 500)
        mockMvc.perform(get("/api/products?sort=status,asc")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isBadRequest());

        // Export CSV filtered for Monitor -> verifies BOM + RFC 4180 escaping of 27" 4K Monitor
        MvcResult csvRes = mockMvc.perform(get("/api/products/export?name=Monitor")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andReturn();
        byte[] bytes = csvRes.getResponse().getContentAsByteArray();
        assertEquals((byte) 0xEF, bytes[0]);
        assertEquals((byte) 0xBB, bytes[1]);
        assertEquals((byte) 0xBF, bytes[2]);
        String csvText = new String(bytes, 3, bytes.length - 3, java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(csvText.startsWith("SKU,Name,Category,Quantity,Price,Value,Status"));
        assertTrue(csvText.contains("\"27\"\" 4K Monitor\""));
    }

    @Test
    void ht03_and_dp02_stockAdjustmentOptimisticConflictAndAuditLog() throws Exception {
        String adminToken = loginAndGetToken("admin", "admin123");
        String staffToken = loginAndGetToken("staff", "staff123");

        // Fetch SKU-1001 (id=1, qty=48, version=0)
        MvcResult getRes = mockMvc.perform(get("/api/products/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        long version = objectMapper.readTree(getRes.getResponse().getContentAsString()).get("version").asLong();

        // STAFF cannot adjust stock
        mockMvc.perform(post("/api/products/1/adjustments")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"delta\":5,\"reason\":\"Restock\",\"version\":" + version + "}"))
                .andExpect(status().isForbidden());

        // Negative stock adjustment rejected (400)
        mockMvc.perform(post("/api/products/1/adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"delta\":-999,\"reason\":\"Invalid\",\"version\":" + version + "}"))
                .andExpect(status().isBadRequest());

        // Valid adjustment succeeds -> qty 48 - 8 = 40, version increments
        mockMvc.perform(post("/api/products/1/adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"delta\":-8,\"reason\":\"Damaged units\",\"version\":" + version + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.previousQuantity").value(48))
                .andExpect(jsonPath("$.newQuantity").value(40));

        // Stale update with old version=0 returns 409 Conflict
        String staleUpdate = """
                {"sku":"SKU-1001","name":"Conflict Attempt","category":"Electronics",
                 "quantity":48,"price":24.99,"lowStockThreshold":10,"version":0}""";
        mockMvc.perform(put("/api/products/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(staleUpdate))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("modified")));

        // STAFF can read stock adjustment history
        mockMvc.perform(get("/api/products/1/adjustments")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].reason").value("Damaged units"));

        // Delete product and confirm audit log retains ADJUST_STOCK & DELETE records
        mockMvc.perform(delete("/api/products/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/audit-logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", greaterThan(1)));
    }

    @Test
    void ht01_formulaInjectionNeutralizedAndEmptyExportReturnsHeaderOnly() throws Exception {
        String adminToken = loginAndGetToken("admin", "admin123");

        String formulaBody = """
                {"sku":"sku-inj-1","name":"=CMD('calc')","category":"+Office",
                 "quantity":4,"price":10.00,"lowStockThreshold":1}""";
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(formulaBody))
                .andExpect(status().isCreated());

        MvcResult formulaCsv = mockMvc.perform(get("/api/products/export?name=CMD")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        String csvText = new String(
                formulaCsv.getResponse().getContentAsByteArray(),
                3,
                formulaCsv.getResponse().getContentAsByteArray().length - 3,
                java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(csvText.contains("'=CMD('calc')"));
        assertTrue(csvText.contains("'+Office"));

        MvcResult emptyCsv = mockMvc.perform(get("/api/products/export?name=__NO_SUCH_PRODUCT__")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        String emptyText = new String(
                emptyCsv.getResponse().getContentAsByteArray(),
                3,
                emptyCsv.getResponse().getContentAsByteArray().length - 3,
                java.nio.charset.StandardCharsets.UTF_8);
        assertEquals("SKU,Name,Category,Quantity,Price,Value,Status\r\n", emptyText);
    }
}
