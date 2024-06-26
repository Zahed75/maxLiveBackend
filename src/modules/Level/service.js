const Level = require("./model");

const createLevelService = async (payload) => {
    const isLevelExist = await Level.findOne({
        levelName: payload.levelName,
    });
    let result;

    if (isLevelExist) {
        result = await Level.updateOne(
            {
                levelName: payload.levelName,
            },
            { diamonds: Number(payload.diamonds) }
        );
    } else {
        result = await Level.create(payload);
    }

    return result;
};
const getAllLevelService = async () => {
    const result = await Level.find();
    return result;
};

const updateLevelService = async (payload, id) => {
    const result = await Level.findByIdAndUpdate(id, { diamonds: payload.diamonds });
    return result ;
};

module.exports = {
    createLevelService,
    getAllLevelService,
    updateLevelService,
};
