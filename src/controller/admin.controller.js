import { AccountModel, UserModel, AdminModel } from "../model/index.js";

const adminController = {
  getAllAccounts: async (req, res) => {
    try {
      const accounts = await AccountModel.find().select("-password");
      res.status(200).send({ message: "Accounts fetched", data: accounts });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error fetching accounts", error: error.message });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const { id } = req.params;

      const account = await AccountModel.findById(id);
      if (!account) {
        throw new Error("Account not found");
      }

      if (account.role === "USER") {
        await UserModel.deleteOne({ accountId: id });
      } else if (account.role === "ADMIN") {
        await AdminModel.deleteOne({ accountId: id });
      }

      await AccountModel.findByIdAndDelete(id);

      res.status(200).send({ message: "Account deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error deleting account", error: error.message });
    }
  },
};

export default adminController;