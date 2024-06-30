const dayjs = require("dayjs");
const { SeatBesideHost } = require("./model");
const { getDurationFromTime } = require("../../utility/common");
const firebase = require("../../utility/firebaseConfig");
const UserModel = require("../User/model");

const createSeatBesideHostService = async (payload) => {
  const timeNumber = parseInt(payload.time, 10);

  payload.time = getDurationFromTime(payload.time, "full");
  const isSkinExistsWithSameTimeAndBeans = await SeatBesideHost.findOne({
    time: payload.time,
  });
  let result;

  if (isSkinExistsWithSameTimeAndBeans) {
    result = await SeatBesideHost.updateOne(
      {
        time: payload.time,
      },
      { beans: Number(payload.beans) }
    );
  } else {
    result = await SeatBesideHost.create(payload);
  }

  return result;
};
const getAllSeatBesideHostService = async () => {
  const result = await SeatBesideHost.find();
  return result;
};

const updateSeatBesideHostService = async (payload, id) => {
  const result = await SeatBesideHost.findByIdAndUpdate(id, {
    beans: payload.beans,
  });
  return result;
};

const bookHotSeatService = async (payload) => {
  const user = await UserModel.findById(payload.userId);
  const seatBesideHost = await SeatBesideHost.findById(
    payload.seatBesideHostsBeansId
  );

  const firebaseUid = user._id.toString() || "";

  const room = await firebase.getRoomById(payload.roomId);

  if (user.beans < seatBesideHost.beans) {
    return {
      status: 400,
      message: "Insufficient beans",
    };
  }

  if (room?.hot_seat?.firebase_uid) {
    return {
      status: 400,
      message: "Seat already booked",
    };
  }

  const updatedRoom = {
    ...room,
    hot_seat: {
      firebase_uid: firebaseUid,
      user_name: user.firstName,
      avatar: user.profilePicture,
      duration: seatBesideHost.time,
      sat_at: firebase.admin.firestore.FieldValue.serverTimestamp(),
    },
  };
  user.beans -= seatBesideHost.beans;
  user.save();
  const roomRef = firebase.admin
    .firestore()
    .collection("live_rooms")
    .doc(payload.roomId);

  await roomRef.set(updatedRoom, { merge: true });

  return { status: 200, message: "Room updated successfully" };
};

const clearHotSeatService = async (payload) => {



  const room = await firebase.getRoomById(payload.roomId);

  const updatedRoom = {
    ...room,
    hot_seat: {}
  };

  const roomRef = firebase.admin
    .firestore()
    .collection("live_rooms")
    .doc(payload.roomId);

  await roomRef.set(updatedRoom, { merge: true });

  return { status: 200, message: "Room updated successfully" };
};

module.exports = {
  createSeatBesideHostService,
  getAllSeatBesideHostService,
  updateSeatBesideHostService,
  bookHotSeatService,
  clearHotSeatService,
};
