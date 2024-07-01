const User = require("../User/model");
const Host = require("../Host/model");
const Agency = require("../Agency/model");
const { generateHostId, parseDurationToMs } = require("../../utility/common");
const { NotFound, BadRequest, Unauthorized } = require("../../utility/errors");

const generateMaxId = require("../../utility/maxId");
const firebase = require("../../utility/firebaseConfig");
const LiveRoom = require("../LiveRoom/model");
const dayjs = require("dayjs");

const applyToBeHostService = async (
  userId,
  agencyId,
  hostType,
  hostId,
  nidFrontPath,
  nidBackPath
) => {
  try {
    // Find the user in the User model
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the agency exists
    const agency = await Agency.findOne({ agencyId: agencyId });
    if (!agency) {
      throw new Error("Agency not found");
    }
    // Generate maxId
    const maxId = generateMaxId();
    // Update the user's host status to "Pending"
    user.hostStatus = "pending";
    user.hostType = hostType;
    user.hostId = hostId;
    user.agencyId = agencyId;
    user.isActive = user.isActive;
    user.isVerified = user.isVerified;
    user.isApproved = user.isApproved;
    user.profilePicture = user.profilePicture;
    maxId, (user.nidFront = nidFrontPath);
    user.nidBack = nidBackPath;
    await user.save();

    return user;
  } catch (error) {
    console.error("Error applying to be host:", error);
    throw error;
  }
};

// delete Host service

const deleteHostService = async (id) => {
  const hostUsers = Host.findByIdAndDelete({ _id: id });
  if (!hostUsers) {
    throw new NotFound("Host not found");
  }
  return hostUsers;
};

const hostSalaryService = async (agencyId) => {
  // 0.000075 = 7.5$ on 1lac diamonds
  // 0.00007 = 7$ on 1lac diamonds
  // 0.00003 = 3$ on 1lac diamonds
  const hosts = await Host.find({ agencyId });
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const hostIds = hosts.map(host => host._id);
  const liveRooms = await LiveRoom.find({
    host_id: { $in: hostIds },
    ended_at: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
  });

  const hostLiveRooms = liveRooms.reduce((acc, room) => {
    if (!acc[room.host_id]) {
      acc[room.host_id] = [];
    }
    acc[room.host_id].push(room);
    return acc;
  }, {});

  const salaries = [];
  let totalHostSalary = 0;
  let totalHostReward = 0;

  const calculateSalary = (host, totalDiamondsReward, totalLiveCompleteDuration, isTenDaysCompletedByHost) => {
    let salary;
    if (totalDiamondsReward > host.monthlyTarget) {
      if (host.hostType === "VD") {
        if (totalLiveCompleteDuration < 60000000 || !isTenDaysCompletedByHost) { // 60000000ms = 20 hours
          salary = host.monthlyTarget * 0.000075 + (totalDiamondsReward - host.monthlyTarget) * 0.000075 * 0.5;
        } else {
          salary = host.monthlyTarget * 0.00007 + host.monthlyTarget * 0.00003 + ((totalDiamondsReward - host.monthlyTarget) * 0.00007 + (totalDiamondsReward - host.monthlyTarget) * 0.00003) * 0.5;
        }
      } else {
        salary = host.monthlyTarget * 0.000075 + (totalDiamondsReward - host.monthlyTarget) * 0.000075 * 0.5;
      }
    } else {
      if (host.hostType === "VD") {
        if (totalLiveCompleteDuration < 60000000 || !isTenDaysCompletedByHost) { // 60000000ms = 20 hours
          salary = totalDiamondsReward * 0.000075;
        } else {
          salary = totalDiamondsReward * 0.00007 + totalDiamondsReward * 0.00003;
        }
      } else {
        salary = totalDiamondsReward * 0.000075;
      }
    }
    return salary;
  };

  for (const host of hosts) {
    const isTenDaysCompletedByHost = !dayjs(host.createdAt).isAfter(dayjs().subtract(10, 'day'));
    const liveRoomByHost = hostLiveRooms[host._id] || [];

    const totalDiamondsReward = liveRoomByHost.reduce((sum, item) => sum + item.diamondsReward, 0);
    const totalLiveCompleteDuration = liveRoomByHost.reduce((sum, item) => sum + parseDurationToMs(item.duration), 0);

    const salary = calculateSalary(host, totalDiamondsReward, totalLiveCompleteDuration, isTenDaysCompletedByHost);

    const hostSalary = {
      ...host.toObject(),
      salary: Math.round(salary),
      rooms: liveRoomByHost,
      totalLiveCompleteDuration
    };
    salaries.push(hostSalary);
    totalHostSalary += Math.round(salary);
    totalHostReward += totalDiamondsReward;
  }

  return {
    hosts: salaries,
    totalHostSalary,
    totalHostReward
  };
};


const sendBeansToHostService = async (payload) => {
  const { hostId, beans, userId, roomId } = payload;
  const host = await Host.findById(hostId);
  const user = await User.findById(userId);
  const room = await firebase.getRoomById(roomId);
  const roomRef = firebase.admin
    .firestore()
    .collection("live_rooms")
    .doc(roomId);

  if (!host) {
    throw new NotFound("Host not found");
  }
  if (!user) {
    throw new NotFound("User not found");
  }
  if (!room) {
    throw new NotFound("Room not found");
  }
  if (user.beans < beans) {
    throw new Error("Insufficient beans");
  }
  if (0 > beans) {
    throw new Error("Beans must be a positive number");
  }
  if (!room.diamondsReward) {
    room.diamondsReward = 0;
  }
  const updatedRoom = {
    ...room,
    diamondsReward: room.diamondsReward + beans,
  };
  user.beans -= beans;
  user.save();
  await roomRef.set(updatedRoom, { merge: true });
  return room;
};

module.exports = {
  applyToBeHostService,
  deleteHostService,
  sendBeansToHostService,
  hostSalaryService,
};
