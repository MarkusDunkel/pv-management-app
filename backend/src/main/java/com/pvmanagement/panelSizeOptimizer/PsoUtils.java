package com.pvmanagement.panelSizeOptimizer;

import java.util.ArrayList;
import java.util.List;

public class PsoUtils {

    public static List<Double> linearList(int count, double min, double max) {
        List<Double> result = new ArrayList<>(count);

        if (count == 1) {
            result.add(min);
            return result;
        }

        double step = (max - min) / (count - 1);

        for (int i = 0; i < count; i++) {
            result.add(min + i * step);
        }

        return result;
    }
}
