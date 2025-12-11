package com.pvmanagement.scheduler;

import com.pvmanagement.service.SemSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Profile({"collector"})
@Component
public class SemSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(SemSyncScheduler.class);

    private final SemSyncService semSyncService;

    public SemSyncScheduler(SemSyncService semSyncService) {
        this.semSyncService = semSyncService;
    }

    @Scheduled(fixedDelayString = "${sems.refresh-interval-ms}")
    public void refreshData() {
        try {
            semSyncService.triggerSync();
        } catch (Exception ex) {
            log.warn("Scheduled SEMS sync failed: {}", ex.getMessage());
        }
    }
}
