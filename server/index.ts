import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import { v4 as generateID } from 'uuid';
import bcrypt from 'bcrypt';
import { UserType } from '../types';

const app = express();
const PORT = process.env.SERVER_PORT || 5500;
const corsOptions = {
  origin: `http://localhost:${process.env.FRONT_PORT}`  // Nustatome leidžiamą origin
};
const DB_CONNECTION = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.${process.env.CLUSTER_ID}.mongodb.net/`;

app.use(express.json());  // JSON requestų apdorojimas
app.use(cors(corsOptions));  // CORS naudojimas

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}.`));

// ********** Vartotojų routes ********** //

// Funkcija patikrinti, ar vartotojo slapyvardis ir el. paštas unikalūs prieš registraciją
const checkUniqueUser = async (req: Request, res: Response<{errorMessage: string} | { error: unknown }>, next: NextFunction) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const sameEmail = await client.db('chatas').collection<UserType>('users').findOne({ email: req.body.email });
    const sameUsername = await client.db('chatas').collection<UserType>('users').findOne({ username: req.body.username });
    
    if(sameEmail) {
      res.status(409).send({ errorMessage: 'Vartotojas su tokiu email jau egzistuoja.' });
    } else if(sameUsername) {
      res.status(409).send({ errorMessage: 'Vartotojas su tokiu slapyvardžiu jau egzistuoja.' });
    } else {
      next();  // Jei vartotojo nėra, tęsiame
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err });
  } finally {
    client?.close();  // Uždarykime ryšį su MongoDB
  }
};

// POST užklausa registruojant naują vartotoją
app.post('/api/users', checkUniqueUser, async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const userToInsert = {
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 10),  // Hashiname slaptažodį
      _id: generateID(),
      profileImage: req.body.profileImage || 'default-profile.png'  // Jei nėra nuotraukos, naudojama numatytoji
    };
    const data = await client.db('chatas').collection('users').insertOne(userToInsert);
    res.send(userToInsert);
  } catch(err) {
    res.status(500).send({ error: err });
  } finally {
    client?.close();  // Uždarykime ryšį su MongoDB
  }
});

// POST užklausa vartotojui prisijungti
app.post('/api/users/login', async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const data = await client.db('chatas').collection<UserType>('users').findOne({ username: req.body.username });
    if (data === null) {
      res.status(401).send({ error: 'Vartotojas su tokiu username arba/ir password neegzsituoja.' });
    } else {
      const passCheck = bcrypt.compareSync(req.body.password, data.password);
      if (passCheck === false) {
        res.status(401).send({ error: 'Vartotojas su tokiu username arba/ir password neegzsituoja.' });
      } else {
        res.send(data);  // Grąžiname vartotojo duomenis, jei slaptažodis atitinka
      }
    }
  } catch (err) {
    res.status(500).send({ error: err });
  } finally {
    client?.close();  // Uždarykime ryšį su MongoDB
  }
});

// GET užklausa - visi vartotojai
app.get('/api/users', async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const data = await client.db('chatas').collection('users').find().toArray();
    res.send(data);
  } catch(err) {
    res.status(500).send({ error: err });
  } finally {
    client?.close();  // Uždarykime ryšį su MongoDB
  }
});

// DELETE užklausa pašalinti vartotoją
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const id = req.params.id;
    const deletionResponse = await client.db('chatas').collection<UserType>('users').deleteOne({ _id: id });
    res.send(deletionResponse);
  } catch(err) {
    res.status(500).send({ error: err });
  } finally {
    client?.close();  // Uždarykime ryšį su MongoDB
  }
});

// Pagrindinis maršrutas testavimui
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running and ready!');
});

app.post('/users', checkUniqueUser, async (req: Request, res: Response) => {
    const client = await MongoClient.connect(DB_CONNECTION);
    try {
      const userToInsert = {
        ...req.body,
        password: bcrypt.hashSync(req.body.password, 10),
        _id: generateID(),
        profileImage: req.body.profileImage || 'default-profile.png'  // Jei neįvesta, naudokime numatytąją nuotrauką
      };
      const data = await client.db('chatas').collection('users').insertOne(userToInsert);
      res.send(userToInsert);
    } catch(err) {
      res.status(500).send({ error: err });
    } finally {
      client?.close();
    }
  });