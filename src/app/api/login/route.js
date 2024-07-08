import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import connection from "../../../helper/db";
import pool from "../../../helper/db2";

export async function POST(request) {
  const { email, password } = await request.json();
  const db = await pool.getConnection();

  try {
    //fetch user by email id
    const [rows] = await db.execute("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    console.log(rows);
    if (rows.length === 0) {
      return NextResponse.json({
        message: "User Doesn't Exist",
        success: false,
      });
    }
    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({
        message: "Invalid Password",
        success: false,
        //user: user,
      });
    }

    //creating token
    const token = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_KEY
    );
    //create next-response cookie
    const response = NextResponse.json({
      message: "Login Success",
      success: true,
      token: token,
      user: user,
    });
    response.cookies.set("authToken", token, {
      expiresIn: "1d",
      httpOnly: true,
    });
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}