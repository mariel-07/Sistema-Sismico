import { apiClient } from "./client";
import type {
  EventStatistics,
  EventsQuery,
  MapEventsQuery,
  SeismicEvent,
} from "../../types/event";

export async function getEvents(
  query: EventsQuery = {},
): Promise<SeismicEvent[]> {
  const response = await apiClient.get<SeismicEvent[]>("/events/", {
    params: query,
  });
  return response.data;
}

export async function getRecentEvents(
  limit = 20,
): Promise<SeismicEvent[]> {
  const response = await apiClient.get<SeismicEvent[]>("/events/recent", {
    params: { limit },
  });
  return response.data;
}

export async function getMapEvents(
  query: MapEventsQuery = {},
): Promise<SeismicEvent[]> {
  const response = await apiClient.get<SeismicEvent[]>("/events/map", {
    params: query,
  });
  return response.data;
}

export async function getEventStatistics(
  filters: Pick<EventsQuery, "start" | "end"> = {},
): Promise<EventStatistics> {
  const response = await apiClient.get<EventStatistics>(
    "/events/statistics",
    { params: filters },
  );
  return response.data;
}

export async function getEventById(id: string): Promise<SeismicEvent> {
  const response = await apiClient.get<SeismicEvent>(
    `/events/${encodeURIComponent(id)}`,
  );
  return response.data;
}