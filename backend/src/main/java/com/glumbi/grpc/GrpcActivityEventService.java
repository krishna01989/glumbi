package com.glumbi.grpc;

import com.glumbi.service.ChildActivityEventService;
import com.glumbi.service.ChildActivityEventService.EventDto;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@GrpcService
@RequiredArgsConstructor
public class GrpcActivityEventService extends ActivityEventServiceGrpc.ActivityEventServiceImplBase {

    private final ChildActivityEventService service;

    @Override
    public void batchEvents(BatchEventsRequest request, StreamObserver<BatchEventsResponse> responseObserver) {
        var caller = GrpcAuthInterceptor.AUTH_USER_KEY.get();

        List<EventDto> dtos = request.getEventsList().stream()
                .map(e -> new EventDto(
                        e.getChildId(),
                        e.getChildName(),
                        e.getFeature(),
                        e.getEventType(),
                        e.getOnline(),
                        e.getDurationSeconds() > 0 ? e.getDurationSeconds() : null,
                        e.getMetadata().isEmpty() ? null : e.getMetadata(),
                        e.getOccurredAt().isEmpty() ? null : e.getOccurredAt(),
                        e.getClientKey().isEmpty() ? null : e.getClientKey()
                ))
                .toList();

        int saved = service.saveBatch(dtos, caller.id(), caller.email());

        responseObserver.onNext(BatchEventsResponse.newBuilder().setSaved(saved).build());
        responseObserver.onCompleted();
    }
}
