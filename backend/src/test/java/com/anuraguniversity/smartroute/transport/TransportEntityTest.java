package com.anuraguniversity.smartroute.transport;

import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.Zone;
import com.anuraguniversity.smartroute.common.enums.Direction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TransportEntityTest {

    @Test
    void zone_ShouldCreateWithValidData() {
        Zone zone = Zone.create("Test Zone", "TEST", "Description", 1);

        assertNotNull(zone);
        assertEquals("Test Zone", zone.getName());
        assertEquals("TEST", zone.getCode());
        assertEquals("Description", zone.getDescription());
        assertEquals(1, zone.getDisplayOrder());
        assertTrue(zone.getActive());
    }

    @Test
    void bus_ShouldCreateWithValidData() {
        Bus bus = Bus.create("TS01AB1234", "Driver Name", "Conductor Name");

        assertNotNull(bus);
        assertEquals("TS01AB1234", bus.getRegistrationNumber());
        assertEquals("Driver Name", bus.getDriverName());
        assertEquals("Conductor Name", bus.getConductorName());
        assertEquals(50, bus.getCapacity());
        assertTrue(bus.getActive());
        assertEquals(0, bus.getCurrentStudentsCount());
    }

    @Test
    void bus_ShouldCalculateAvailableCapacity() {
        Bus bus = Bus.create("TS01AB1234", "Driver", "Conductor");
        bus.setCapacity(50);
        bus.setCurrentStudentsCount(30);

        assertEquals(20, bus.getAvailableCapacity());
        assertTrue(bus.hasAvailableCapacity());
        assertTrue(bus.canAccommodate(10));
        assertFalse(bus.canAccommodate(25));
    }

    @Test
    void bus_ShouldHandleFullCapacity() {
        Bus bus = Bus.create("TS01AB1234", "Driver", "Conductor");
        bus.setCapacity(50);
        bus.setCurrentStudentsCount(50);

        assertEquals(0, bus.getAvailableCapacity());
        assertFalse(bus.hasAvailableCapacity());
        assertFalse(bus.canAccommodate(1));
    }

    @Test
    void route_ShouldCreateWithValidData() {
        Zone zone = new Zone();
        zone.setId(UUID.randomUUID());
        zone.setName("Test Zone");

        Route route = Route.create(zone, "R001", "Route 1", Direction.MORNING, 1);

        assertNotNull(route);
        assertEquals(zone, route.getZone());
        assertEquals("R001", route.getRouteCode());
        assertEquals("Route 1", route.getRouteName());
        assertEquals(Direction.MORNING, route.getDirection());
        assertEquals(1, route.getDisplayOrder());
        assertTrue(route.getActive());
    }

    @Test
    void route_ShouldSetBus() {
        Zone zone = new Zone();
        zone.setId(UUID.randomUUID());
        Route route = Route.create(zone, "R001", "Route 1", Direction.MORNING, 1);

        Bus bus = Bus.create("TS01AB1234", "Driver", "Conductor");
        route.setBus(bus);

        assertEquals(bus, route.getBus());
    }

    @Test
    void boardingPoint_ShouldCreateWithValidData() {
        Zone zone = new Zone();
        zone.setId(UUID.randomUUID());
        Route route = Route.create(zone, "R001", "Route 1", Direction.MORNING, 1);

        BoardingPoint bp = BoardingPoint.create(
                route, 
                "Stop 1", 
                "Description", 
                1, 
                LocalTime.of(8, 0), 
                new BigDecimal("17.3850"), 
                new BigDecimal("78.4867"), 
                "Landmark"
        );

        assertNotNull(bp);
        assertEquals(route, bp.getRoute());
        assertEquals("Stop 1", bp.getStopName());
        assertEquals("Description", bp.getStopDescription());
        assertEquals(1, bp.getStopOrder());
        assertEquals(LocalTime.of(8, 0), bp.getStopTime());
        assertEquals(new BigDecimal("17.3850"), bp.getLatitude());
        assertEquals(new BigDecimal("78.4867"), bp.getLongitude());
        assertEquals("Landmark", bp.getLandmark());
        assertTrue(bp.getActive());
    }
}