import RegisterAndLoginForm from "./Register";
import { useContext } from "react";
import { UserContext } from "./UserContext.jsx";
import Chat from "./Chat";

export default function Route() {
    const {username, id} = useContext(UserContext);

    if (username) {
        return <Chat />;
    }

    return (
        <RegisterAndLoginForm />
    );
}