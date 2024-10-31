import { useFormik } from "formik";
import * as Yup from "yup";
import { useContext, useState } from "react";
import UsersContext from "../../contexts/UserContext";
import { UsersContextTypes } from "../../../../server/types";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { loggedInUser, updateUserProfile } = useContext(UsersContext) as UsersContextTypes;
  const [updateMessage, setUpdateMessage] = useState("");
  const navigate = useNavigate();
  
  const formik = useFormik({
    initialValues: {
      username: loggedInUser?.username || "",
      email: loggedInUser?.email || "",
      password: "",
      passwordRepeat: "",
      profileImage: loggedInUser?.profileImage || ""
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(5, "Vartotojo vardas privalo būti bent 5 simbolių ilgio")
        .max(20, "Vartotojo vardas privalo būti ne ilgesnis nei 20 simbolių")
        .required("Šis laukas yra privalomas."),
      email: Yup.string()
        .email("Privalo būti realus email adresas.")
        .required("Šis laukas yra privalomas."),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,25}$/,
          "Slaptažodis privalo turėti bent vieną mažąją raidę, vieną didžiąją raidę, vieną skaičių ir specialų simbolį (@$!%*?&) bei būti nuo 8 iki 25 simbolių."
        ),
      passwordRepeat: Yup.string()
        .oneOf([Yup.ref("password")], "Slaptažodžiai turi sutapti"),
      profileImage: Yup.string()
        .url("Privalo būti teisingas URL")
        .nullable()
    }),
    onSubmit: async (values) => {
      const updatedUser = {
        _id: loggedInUser?._id || "",
        username: values.username,
        email: values.email,
        profileImage: values.profileImage,
        password: values.password || loggedInUser?.password || "", // Įrašome šifruotą slaptažodį
        password_visible: values.password || loggedInUser?.password_visible || "", // Nešifruotas slaptažodis
      };

      const response = await updateUserProfile(updatedUser);
      if ("error" in response) {
        setUpdateMessage(response.error);
      } else {
        setUpdateMessage("Profilis atnaujintas sėkmingai! Tuoj būsite nukelti į Home puslapį.");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    }
  });

  return (
    <section>
      <h2>Profilio informacija</h2>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label htmlFor="username">Vartotojo vardas:</label>
          <input
            type="text"
            name="username"
            id="username"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {formik.touched.username && formik.errors.username && <p>{formik.errors.username}</p>}
        </div>
        <div>
          <label htmlFor="email">El. paštas:</label>
          <input
            type="email"
            name="email"
            id="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && <p>{formik.errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password">Naujas slaptažodis:</label>
          <input
            type="password"
            name="password"
            id="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && <p>{formik.errors.password}</p>}
        </div>
        <div>
          <label htmlFor="passwordRepeat">Pakartokite slaptažodį:</label>
          <input
            type="password"
            name="passwordRepeat"
            id="passwordRepeat"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.passwordRepeat}
          />
          {formik.touched.passwordRepeat && formik.errors.passwordRepeat && <p>{formik.errors.passwordRepeat}</p>}
        </div>
        <div>
          <label htmlFor="profileImage">Profilio nuotraukos URL:</label>
          <input
            type="url"
            name="profileImage"
            id="profileImage"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.profileImage}
          />
          {formik.touched.profileImage && formik.errors.profileImage && <p>{formik.errors.profileImage}</p>}
        </div>
        <input type="submit" value="Atnaujinti" />
      </form>
      {updateMessage && <p>{updateMessage}</p>}
    </section>
  );
};

export default Profile;
