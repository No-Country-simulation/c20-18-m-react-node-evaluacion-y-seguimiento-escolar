import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient();
import { comparePasswords } from "../services/password.services.js"
import { generarToken } from "../services/jwt.services.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!(email || password))
    return res.status(500).json({ message: "One or more fields are missing" });

  try {
    const credentials = await prisma.usuario.findUnique({
      where: { email: email },
    });

    const validPassword =
      credentials === null
        ? false
        : await comparePasswords(password, credentials.password);

    if (!(credentials && validPassword))
      return res
        .status(401)
        .json({ Error: "unauthorized.", message: "email or password invalid" });

    const userForToken = {
      email: credentials.email,
      id: credentials.id,
      role: credentials.role,
    };

    const token = generarToken(userForToken)

    res.status(200).json({
      token,
      nombre: credentials.nombre,
      apellido: credentials.apellido,
      email: credentials.email,
      role: credentials.role,
    });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
};

