import jwt from "jsonwebtoken";
import { User } from "../db/models/models-config";
import { UserInputError, AuthenticationError } from "apollo-server";
import { getFormValidationErrors } from "@guybendavid/utils";

interface DecodedToken {
  id: number;
  firstName: string;
  lastName: string;
}

const { SECRET_KEY } = process.env;

export default async (context: any) => {
  try {
    if (context.req?.body) {
      const { message } = getFormValidationErrors(context.req.body.variables);
      if (message) throw new UserInputError(message);
    }

    const authHeader =
      context.req?.headers?.authorization ||
      context.connection?.context?.authorization;

    const token = authHeader?.split("Bearer ").pop();

    // Allow unauthenticated access for login/register
    if (
      (!token || token === "null") &&
      ["LoginUser", "RegisterUser"].includes(context.req?.body?.operationName)
    ) {
      return context;
    }

    if (!token || token === "null") {
      throw new AuthenticationError("Token missing or malformed");
    }

    const decoded = jwt.verify(token, SECRET_KEY as string) as DecodedToken;

    if (!decoded || !decoded.id) {
      return { user: null };
    }

    const user = await User.findOne({ where: { id: decoded.id } });

    return { user: user?.toJSON() || null };
  } catch (error) {
    console.error("Context creation error:", error);
    throw new AuthenticationError("Unauthenticated");
  }
};
