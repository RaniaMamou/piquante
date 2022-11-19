const Sauce = require("../models/sauce.model");
const fs = require("fs");

function getAllSauces(req, res, next) {
  Sauce.find()
    .then((sauces) => res.status(201).json(sauces))
    .catch(() => res.status(400).json({ error }));
}
function createSauce(req, res) {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    userLiked: [],
    userDisliked: [],
  });
  sauce
    .save()
    .then(() =>
      res.status(201).json({ message: "new Sauce created successfully" })
    )
    .catch(() => res.status(400).json({ error }));
}
function updateSauce(req, res, next) {
  if (!req.file) {
    Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
      .then(() =>
        res.status(200).json({ message: "La sauce a été bien modifié" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else {
    //find the sauce and get its imageUrl
    // delete "http://localhost:8009/" from it
    // use it to unlink the image from images folder using fs.unlink
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const lastImgUrl = sauce.imageUrl.replace("http://localhost:8009/", "");
        fs.unlink(lastImgUrl, (err) => {
          return console.log(err);
          console.log(`deleted image: ${lastImgUrl}`);
        });
      })
      .catch((error) => {
        console.log(error);
      });
    Sauce.updateOne(
      { _id: req.params.id },
      {
        ...req.body,
        _id: req.params.id,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    )
      .then(() =>
        res.status(200).json({ message: "La sauce a été bien modifié" })
      )
      .catch((error) => res.status(400).json({ error }));
  }
}
function deleteSauce(req, res, next) {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
}
function existsUserId(array, userId) {
  let userExists = false;
  for (let i = 0; i < array.length; i++) {
    if (array[i] === userId) {
      userExists = true;
    }
  }
  return userExists;
}
function getOneSauce(req, res, next) {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
}
async function updateSauceLikeStatus(req, res, next) {
  const like = req.body.like;
  const userId = req.body.userId;
  const sauce = await Sauce.findOne({ _id: req.params.id });

  if (!sauce) {
    console.log("Sauce not found");
    res.status(404).json({ error: "Sauce not found" });
  } else if (like === 0) {
    console.log("Like or dislike delete");
    RemoveLikeOrDislike(req, res, sauce, userId);
  } else if (like === 1) {
    console.log("Like received ");
    addNewLike(req, res, sauce, userId);
    //res.status(200).json({ message: 'Like added' });
  } else if (like === -1) {
    console.log("Dislike Received  ");
    addNewDislike(req, res, sauce, userId);
  } else {
    console.log("Bad Request received");
    res.status(400).json({ error: "Bad Request" });
  }
}

function addNewLike(req, res, sauce, userId) {
  if (existsUserId(sauce.usersLiked, userId) === false) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        likes: sauce.likes + 1,
        $addToSet: {
          usersLiked: userId,
        },
      }
    )
      .then(() => res.status(200).json({ message: "Like bien ajouté!" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    res.status(200).json({ message: "Like exist déja!!" });
  }
}
function addNewDislike(req, res, sauce, userId) {
  if (existsUserId(sauce.usersDisliked, userId) === false) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        dislikes: sauce.dislikes + 1,
        $addToSet: {
          usersDisliked: userId,
        },
      }
    )
      .then(() => res.status(200).json({ message: "Dislike bien ajouté!" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    res.status(200).json({ message: "Dislike exist déja!!" });
  }
}
function RemoveLikeOrDislike(req, res, sauce, userId) {
  if (existsUserId(sauce.usersLiked, userId) !== false) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        likes: sauce.likes - 1,
        $pull: {
          usersLiked: userId,
        },
      }
    )
      .then(() =>
        res.status(200).json({ message: "Like removed successfuly!!" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else if (existsUserId(sauce.usersDisliked, userId) !== false) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        dislikes: sauce.dislikes - 1,
        $pull: {
          usersDisliked: userId,
        },
      }
    )
      .then(() =>
        res.status(200).json({ message: "Dislike removed successfuly!!" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else {
    res.status(400).json({ message: "Bad Request" });
  }
}

module.exports = {
  getAllSauces,
  getOneSauce,
  createSauce,
  updateSauce,
  updateSauceLikeStatus,
  deleteSauce,
};
