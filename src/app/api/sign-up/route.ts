import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request){
    await dbConnect();
    try {
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUser = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUser) {
            return Response.json({
                success: false,
                message: 'User is already taken , try another username'
            }, {status: 400})
        }

        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                }, {status: 400})
            } else {
               const hasedPassword = await bcrypt.hash(password, 10)
               existingUserByEmail.password = hasedPassword; 
               existingUserByEmail.verifyCode = verifyCode;
               existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
               await existingUserByEmail.save()
            }

        }else{
            const hasedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

           const newUser = new UserModel({
                username,
                email,
                password,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()

        }

        //send verification email
        const emailResponce = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponce){
            return Response.json({
                success: false,
                message: 'Error sending verification email'
            }, {status: 500})
              
        }

        return Response.json({
            success: true,
            message: 'User registered successfully, Please verify your email'
        }, {status: 201})

    } catch (error) {
        console.log('Error registering user', error);
        return Response.json(
            {
                success: false,
                message: 'Error registering user'
            },
            {
                status: 500
            }
        )
        
    }
}