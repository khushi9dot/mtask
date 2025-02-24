import nodemailer from "nodemailer"

const sendEmail=async(to,subject,text)=>{
    const transporter=nodemailer.createTransport({
        service:"Gmail",
        auth:{
            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from:process.env.EMAIL,
        to,
        subject,
        text
    })
}

export {sendEmail}