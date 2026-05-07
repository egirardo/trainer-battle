import Button from "../components/atoms/button";
import InputField from "../components/atoms/InputField";

export default function AdminLogin() {
    return(
        <main>
            <div>
                <h1>Login to admin panel</h1>
                <form>
                    <InputField
                        labelName="Username"
                        id="username"
                        name="username"
                        placeholder="Enter username"
                    />
                    <InputField 
                        labelName="Password"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter password"
                    />
                    <Button type="submit">
                        Login
                    </Button>
                </form>
            </div>
        </main>
    )
}