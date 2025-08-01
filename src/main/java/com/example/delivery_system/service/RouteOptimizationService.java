package com.example.delivery_system.service;

import com.google.ortools.Loader;
import com.google.ortools.constraintsolver.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RouteOptimizationService {

    public String optimizeRoute(List<Double> latitudes, List<Double> longitudes) {
        Loader.loadNativeLibraries();

        // Giả lập dữ liệu khoảng cách (tính Euclidean cho đơn giản)
        int n = latitudes.size();
        long[][] distanceMatrix = new long[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                double latDiff = latitudes.get(i) - latitudes.get(j);
                double lonDiff = longitudes.get(i) - longitudes.get(j);
                distanceMatrix[i][j] = (long) Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
            }
        }

        // Cấu hình OR-Tools
        RoutingIndexManager manager = new RoutingIndexManager(distanceMatrix.length, 1, 0);
        RoutingModel routing = new RoutingModel(manager);

        final int vehicleId = 0; // Chỉ số của phương tiện đầu tiên (và duy nhất)

        // Đăng ký hàm tính chi phí (transit callback)
        final int transitCallbackIndex = routing.registerTransitCallback((long fromIndex, long toIndex) -> {
            int fromNode = manager.indexToNode(fromIndex);
            int toNode = manager.indexToNode(toIndex);
            return distanceMatrix[fromNode][toNode];
        });

        // Thiết lập hàm chi phí cho tất cả các phương tiện
        routing.setArcCostEvaluatorOfAllVehicles(transitCallbackIndex);

        RoutingSearchParameters searchParameters = main.defaultRoutingSearchParameters()
                .toBuilder()
                .setFirstSolutionStrategy(FirstSolutionStrategy.Value.PATH_CHEAPEST_ARC)
                .build();

        Assignment solution = routing.solveWithParameters(searchParameters);
        StringBuilder route = new StringBuilder();
        long index = routing.start(vehicleId);
        while (!routing.isEnd(index)) {
            route.append(manager.indexToNode(index)).append(" -> ");
            index = solution.value(routing.nextVar(index));
        }
        route.append(manager.indexToNode(index));

        return route.toString();
    }
}