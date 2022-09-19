import { Request, Response } from "express";
import FollowData from "../data/FollowData";
import RecipeData from "../data/RecipeData";
import UserData from "../data/UserData";
import Confict from "../error/Confict";
import EmailNotRegistered from "../error/EmailNotRegistered";
import FollowNotFound from "../error/FollowNotFound";
import InvalidEmail from "../error/InvalidEmail";
import InvalidPassword from "../error/InvalidPassword";
import MissingParameters from "../error/MissingParameters";
import NoRecipesFound from "../error/NoRecipesFound";
import SmallPassword from "../error/SmallPassword";
import UserNotFound from "../error/UserNotFound";
import Follow from "../models/Follow";
import User, { UserProfile } from "../models/User";
import Authenticator from "../services/Authenticator";
import EmailVerify from "../services/EmailVerify";
import GenerateId from "../services/GenerateId";
import HashManager from "../services/HashManager";
import { UserRoles } from "../types/AuthenticatorData";

class UserController {

    public async feed(req: Request, res: Response) {

        try {
            const token = req.headers.authorization as string;

            if (!token) {
                throw new MissingParameters("authorization");
            }

            const authenticator = new Authenticator();
            const authenticatorData = authenticator.getData(token);

            const followData = new FollowData();
            const following: Follow[] = await followData.selectAllFollowingByUserId(authenticatorData.id);

            if (!following) {
                throw new FollowNotFound("You are not following anyone.");
            }

            const result = following.map(async (follow: Follow) => {
                const recipeData = new RecipeData();
                const recipe = await recipeData.selectRecipeByCreatorId(follow.getIdFollowed());
                return recipe;
            })

            const recipes = await Promise.all(result);

            if (recipes[0] === undefined) {
                throw new NoRecipesFound();
            }

            res.status(200).send({ recipes: recipes.flat(1)});

        } catch (error) {
            error.sqlMessage ? res.status(500).send({ message: error.sqlMessage }) 
                : res.status(error.statusCode || 400).send({ message: error.message });
        };
    }


    public async anotherProfile(req: Request, res: Response): Promise<UserProfile | void> {
        try {
            const token = req.headers.authorization as string;
            const id = req.params.id as string;

            if (!token || !id) {
                throw new MissingParameters("authorization and id");
            };

            const authenticator = new Authenticator();
            authenticator.getData(token);

            const userData = new UserData();
            const user = await userData.selectUserById(id);

            if (!user) {
                throw new UserNotFound();
            }

            const userProfile: UserProfile = { id: user.getId(), name: user.getName(), email: user.getEmail()};

            res.status(200).send(userProfile);

        } catch (error) {
            error.sqlMessage ? res.status(500).send({ message: error.sqlMessage }) 
                : res.status(error.statusCode || 400).send({ message: error.message });
        };
    };

    public async personalProfile(req: Request, res: Response): Promise<UserProfile | void> {
        try {
            const token = req.headers.authorization as string;

            if (!token) {
                throw new MissingParameters("authorization");
            }

            const authenticator = new Authenticator();
            const authenticatorData = authenticator.getData(token);

            const userData = new UserData();
            const user = await userData.selectUserById(authenticatorData.id);
            
            const userProfile: UserProfile = { id: user.getId(), name: user.getName(), email: user.getEmail()};

            res.status(200).send(userProfile);

        } catch (error) {
            error.sqlMessage ? res.status(500).send({ message: error.sqlMessage }) 
                : res.status(error.statusCode || 400).send({ message: error.message });
        };
    };


    public async signup(req: Request, res: Response) {
        try {
            const { name, email, password, role} = req.body;

            if (!name || !email || !password || !role) {
                throw new MissingParameters("name, email, password and role");
            };

            if(role !== UserRoles.ADMIN && role !== UserRoles.USER) {
                throw new Confict("Invalid role, please use 'ADMIN' or 'USER'");
            }

            if (password.length < 6) {
                throw new SmallPassword();
            };

            const emailVerify = new EmailVerify();
            const emailIsValid = emailVerify.verify(email);

            if (!emailIsValid) {
                throw new InvalidEmail();
            };

            const userData = new UserData();
            const isRegistered = await userData.selectUserByEmail(email);

            if (isRegistered) {
                throw new Confict("Email already registered.");
            };

            const generateId = new GenerateId();
            const id = generateId.generate();

            const hashManager = new HashManager();
            const hashPassword = await hashManager.hash(password);

            const user = new User(id, name, email, hashPassword, role);
            await userData.insertUser(user);

            const authenticator = new Authenticator();
            const token = authenticator.generateToken({ id: user.getId(), role: user.getRole() });

            res.status(201).send({ token });
 
        } catch (error) {
            error.sqlMessage ? res.status(500).send({ message: error.sqlMessage }) 
                : res.status(error.statusCode || 400).send({ message: error.message });
        };
    }

    public async login(req: Request, res: Response) {
        try {
            const { email, password} = req.body;

            if (!email || !password) {
                throw new MissingParameters("email and password");
            };

            if (password.length < 6) {
                throw new SmallPassword();
            };

            const emailVerify = new EmailVerify();
            const emailIsValid = emailVerify.verify(email);

            if (!emailIsValid) {
                throw new InvalidEmail();
            };

            const userData = new UserData();
            const isRegistered = await userData.selectUserByEmail(email);

            if (!isRegistered) {
                throw new EmailNotRegistered();
            };

            const user = isRegistered;
            const hashManager = new HashManager();
            const comparePassword = await hashManager.compare(password, user.getPassword());

            if (!comparePassword) {
                throw new InvalidPassword();
            }

            const authenticator = new Authenticator();
            const token = authenticator.generateToken({ id: user.getId(), role: user.getRole() });

            res.status(200).send({ token });
 
        } catch (error) {
            error.sqlMessage ? res.status(500).send({ message: error.sqlMessage }) 
                : res.status(error.statusCode || 400).send({ message: error.message });
        };
    }

}

export default UserController;