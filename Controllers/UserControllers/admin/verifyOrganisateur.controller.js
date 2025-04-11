const { User } =require('../../../Models/User/user.model') ;

const verifyOrganisateur = async (req, res) => {
    try {
      const user=req.user;
        const { id } = req.params;
        const organisateur = await User.findOne({ _id: id });

        if (!organisateur) {
            return res.status(404).json({ message: "Organisateur non trouvé" });
        }

        organisateur.isVerified = true;
        await organisateur.save();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: organisateur.email,
            subject: "verified ✔",
            text: "your account has been verified !! welcome to our family",
        });
        res.status(200).json({ message: "Organisateur verified" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
module.exports= verifyOrganisateur;