package com.anuraguniversity.smartroute.transport.controller;

import com.anuraguniversity.smartroute.transport.dto.ImportResult;
import com.anuraguniversity.smartroute.transport.service.TransportWorkbookImporter;
import com.anuraguniversity.smartroute.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transport")
@RequiredArgsConstructor
public class TransportController {

    private final TransportWorkbookImporter workbookImporter;

    @PostMapping("/import")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ImportResult>> importWorkbook() {
        ImportResult result = workbookImporter.importWorkbook();
        return ResponseEntity.ok(ApiResponse.success(result, "Transport workbook import completed"));
    }

    @GetMapping("/import/status")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ImportResult>> getImportStatus() {
        // Return last import status or trigger a dry-run
        return ResponseEntity.ok(ApiResponse.success(new ImportResult(), "Import status endpoint"));
    }
}