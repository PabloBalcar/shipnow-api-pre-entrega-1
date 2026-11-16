import UserModel from "../models/user.model.js";

// Por defecto nunca devolvemos el hash/valor de la contraseña.
const PUBLIC_FIELDS = "-password";

export const usersRepository = {
  findAll: () =>
    UserModel.find().select(PUBLIC_FIELDS).sort({ createdAt: -1 }).lean(),

  findById: (id) => UserModel.findById(id).select(PUBLIC_FIELDS).lean(),

  // Uso interno: sí incluye la contraseña.
  findByEmail: (email) => UserModel.findOne({ email }).lean(),

  exists: (id) => UserModel.exists({ _id: id }),

  create: async (userData) => {
    const user = await UserModel.create(userData);
    const { password, ...publicUser } = user.toObject();
    return publicUser;
  },

  updateById: (id, userData) =>
    UserModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    })
      .select(PUBLIC_FIELDS)
      .lean(),

  deleteById: (id) =>
    UserModel.findByIdAndDelete(id).select(PUBLIC_FIELDS).lean(),

  addDocument: (id, document) =>
    UserModel.findByIdAndUpdate(
      id,
      { $push: { documents: document } },
      { new: true, runValidators: true },
    )
      .select(PUBLIC_FIELDS)
      .lean(),
};
