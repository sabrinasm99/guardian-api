const { User } = require('../models');
const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { format } = require('util');
// Instantiate a storage client with credentials
const storage = new Storage({
  keyFilename: path.join(__dirname, '../sacred-armor-346113-862ffb9b3718.json'),
  projectId: 'sacred-armor-346113',
});
const bucket = storage.bucket('ex-bucket-test');

exports.getUserById = async function (req, res) {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });
    res.status(200).send({ message: 'Response Success', data: user });
  } catch (error) {
    res.status(500).send({
      error: {
        message: 'Server Error',
      },
    });
  }
};

exports.updateUser = async function (req, res) {
  try {
    const { id } = req.params;
    const userExist = await User.findOne({ where: { id } });
    if (userExist) {
      const editedData = { ...req.body };
      const oldAvatar = userExist.avatar;
      if (req.file) {
        const imageUrl = await new Promise((resolve, reject) => {
          const { originalname, buffer } = req.file;

          const blob = bucket.file(originalname.replace(/ /g, '_'));
          const blobStream = blob.createWriteStream({
            resumable: false,
          });
          blobStream
            .on('finish', () => {
              const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
              );
              resolve(publicUrl);
            })
            .on('error', () => {
              reject(`Unable to upload image, something went wrong`);
            })
            .end(buffer);
        });
        res.status(200).json({
          message: 'Upload was successful',
          data: imageUrl,
        });
        // await fse.remove(`./images/${oldAvatar}`);
        // const newAvatar = req.files.avatar;
        // const newAvatarName = req.files.avatar.name;
        // await newAvatar.mv(`./images/${newAvatarName}`);
        // editedData.avatar = newAvatarName;
      }
      // await User.update(editedData, { where: { id } });
      // const newDetailUser = await User.findOne({
      //   where: {
      //     id,
      //   },
      //   attributes: {
      //     exclude: ['createdAt', 'updatedAt'],
      //   },
      // });
      // res.status(200).json({
      //   message: `Data with id ${id} has been updated`,
      //   data: newDetailUser,
      // });
      // res.status(200).send('Finish');
    } else {
      res.status(400).send({ message: "Data isn't exist" });
    }
  } catch (error) {
    res.status(500).send({
      error: {
        message: error.message,
      },
    });
  }
};
