package com.anuraguniversity.smartroute.transport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult {

    @Builder.Default
    private int zoneCount = 0;
    @Builder.Default
    private int routeAssignmentCount = 0;
    @Builder.Default
    private int uniqueBusCount = 0;
    @Builder.Default
    private int boardingStopCount = 0;
    @Builder.Default
    private int rowsTransformed = 0;
    @Builder.Default
    private int rowsSkipped = 0;
    @Builder.Default
    private int rowsRejected = 0;
    @Builder.Default
    private boolean workbookMissing = false;
    @Builder.Default
    private final List<String> errors = new ArrayList<>();
    @Builder.Default
    private final Map<String, Long> duplicateRegistrations = new HashMap<>();

    public void incrementZoneCount() { this.zoneCount++; }
    public void incrementRouteAssignmentCount() { this.routeAssignmentCount++; }
    public void incrementUniqueBusCount() { this.uniqueBusCount++; }
    public void incrementBoardingStopCount() { this.boardingStopCount++; }
    public void incrementTransformed() { this.rowsTransformed++; }
    public void incrementSkipped() { this.rowsSkipped++; }
    public void incrementRejected() { this.rowsRejected++; }
    public void addError(String error) { this.errors.add(error); }
    public void addDuplicateRegistration(String registration, long count) { this.duplicateRegistrations.put(registration, count); }

    public boolean hasErrors() { return !errors.isEmpty(); }
    public boolean isSuccessful() { return !workbookMissing && rowsRejected == 0 && !hasErrors(); }
}