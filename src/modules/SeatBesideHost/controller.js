const { asyncHandler } = require("../../utility/common");
const { createSeatBesideHostService,getAllSeatBesideHostService,updateSeatBesideHostService } = require("./service");




const createSeatBesideHostHandler = asyncHandler(async (req, res) => {
  const result = await createSeatBesideHostService(req.body);
  res.status(200).json({
    message: "Beans/Time Created successfully",
    result,
  });
});

const getAllSeatBesideHostHandler = asyncHandler(async (req, res) => {
  const result = await getAllSeatBesideHostService();
  res.status(200).json({
    message: "Beans/Time Retrieved successfully",
    result,
  });
});

const updateSeatBesideHostHandler = asyncHandler(async (req, res) => {
  const result = await updateSeatBesideHostService(req.body, req.params.id);
  res.status(200).json({
    message: "Beans/Time updated successfully",
    result,
  });
});


module.exports = {
    createSeatBesideHostHandler,
    getAllSeatBesideHostHandler,
    updateSeatBesideHostHandler
}