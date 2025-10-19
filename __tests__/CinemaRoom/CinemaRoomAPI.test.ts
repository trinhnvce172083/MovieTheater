import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  CreateRoomInputData,
  UpdateRoomInputData,
  CreateRoomSuccessResponse,
  UpdateRoomSuccessResponse,
  GetRoomSuccessResponse,
  DeleteRoomSuccessResponse,
  RoomNotFoundResponse,
  RoomNameExistsResponse,
  InvalidCapacityResponse,
} from "./CinemaRoom_API.mock";
import { ApiError, ApiResponse, CinemaRoomData } from "./types";

describe("Cinema Room API Tests", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe("createCinemaRoom", () => {
    const url = "/api/cinema-rooms";

    it("should create a new cinema room successfully", async () => {
      mock.onPost(url).reply(200, CreateRoomSuccessResponse);

      const response = await axios.post(url, CreateRoomInputData);
      expect(response.data).toEqual(CreateRoomSuccessResponse);
      expect(response.data.success).toBe(true);
      expect(response.data.data.cinemaRoomName).toBe(CreateRoomInputData.cinemaRoomName);
    });

    it("should handle duplicate room name error", async () => {
      mock.onPost(url).reply(400, RoomNameExistsResponse);

      try {
        await axios.post(url, CreateRoomInputData);
      } catch (error: any) {
        expect(error.response.data).toEqual(RoomNameExistsResponse.response.data);
        expect(error.response.data.errorCode).toBe("CINEMA_ROOM_ALREADY_EXISTS");
      }
    });

    it("should handle invalid capacity error", async () => {
      const invalidInput = { ...CreateRoomInputData, rows: 0, columns: 0 };
      mock.onPost(url).reply(400, InvalidCapacityResponse);

      try {
        await axios.post(url, invalidInput);
      } catch (error: any) {
        expect(error.response.data).toEqual(InvalidCapacityResponse.response.data);
        expect(error.response.data.errorCode).toBe("CINEMA_ROOM_CAPACITY_INVALID");
      }
    });
  });

  describe("updateCinemaRoom", () => {
    const roomId = 1;
    const url = `/api/cinema-rooms/${roomId}`;

    it("should update cinema room successfully", async () => {
      mock.onPut(url).reply(200, UpdateRoomSuccessResponse);

      const response = await axios.put(url, UpdateRoomInputData);
      expect(response.data).toEqual(UpdateRoomSuccessResponse);
      expect(response.data.success).toBe(true);
      expect(response.data.data.cinemaRoomName).toBe(UpdateRoomInputData.cinemaRoomName);
    });

    it("should handle room not found error", async () => {
      mock.onPut(url).reply(404, RoomNotFoundResponse);

      try {
        await axios.put(url, UpdateRoomInputData);
      } catch (error: any) {
        expect(error.response.data).toEqual(RoomNotFoundResponse.response.data);
        expect(error.response.data.errorCode).toBe("CINEMA_ROOM_NOT_FOUND");
      }
    });

    it("should handle duplicate room name error on update", async () => {
      mock.onPut(url).reply(400, RoomNameExistsResponse);

      try {
        await axios.put(url, UpdateRoomInputData);
      } catch (error: any) {
        expect(error.response.data).toEqual(RoomNameExistsResponse.response.data);
        expect(error.response.data.errorCode).toBe("CINEMA_ROOM_ALREADY_EXISTS");
      }
    });
  });

  describe("getCinemaRoom", () => {
    const roomId = 1;
    const url = `/api/cinema-rooms/${roomId}`;

    it("should get cinema room details successfully", async () => {
      mock.onGet(url).reply(200, GetRoomSuccessResponse);

      const response = await axios.get(url);
      expect(response.data).toEqual(GetRoomSuccessResponse);
      expect(response.data.success).toBe(true);
      expect(response.data.data.cinemaRoomId).toBe(roomId);
    });

    it("should handle room not found error", async () => {
      mock.onGet(url).reply(404, RoomNotFoundResponse);

      try {
        await axios.get(url);
      } catch (error: any) {
        expect(error.response.data).toEqual(RoomNotFoundResponse.response.data);
        expect(error.response.data.errorCode).toBe("CINEMA_ROOM_NOT_FOUND");
      }
    });
  });

  describe("deleteCinemaRoom", () => {
    const roomId = 1;
    const url = `/api/cinema-rooms/${roomId}`;

    it("should delete cinema room successfully", async () => {
      mock.onDelete(url).reply(200, DeleteRoomSuccessResponse);

      const response = await axios.delete(url);
      expect(response.data).toEqual(DeleteRoomSuccessResponse);
      expect(response.data.success).toBe(true);
    });

    it("should handle room not found error", async () => {
      mock.onDelete(url).reply(404, RoomNotFoundResponse);

      try {
        await axios.delete(url);
      } catch (error: any) {
        expect(error.response.data).toEqual(RoomNotFoundResponse.response.data);
        expect(error.response.data.errorCode).toBe("CINEMA_ROOM_NOT_FOUND");
      }
    });
  });
});
