import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { MongoClient, ObjectId, Filter } from "mongodb";
import cors from 'cors';
import { v4 as generateID } from 'uuid';
import bcrypt from 'bcrypt';
import { UserType } from './types';

const app = express();
const PORT = process.env.SERVER_PORT || 5500;
const corsOptions = {
  origin: `http://localhost:${process.env.FRONT_PORT}`
};
const DB_CONNECTION = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.${process.env.CLUSTER_ID}.mongodb.net/`;

app.use(express.json());
app.use(cors(corsOptions));

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}.`));
const prisijungtiPrieDB = async () => {
  const client = new MongoClient(DB_CONNECTION);
  await client.connect();
  return client;
};

// ********** Vartotojų routes ********** //

// Funkcija patikrinti, ar vartotojo slapyvardis ir el. paštas unikalūs prieš registraciją
const checkUniqueUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const sameEmail = await client.db('chatas').collection<UserType>('users').findOne({ email: req.body.email });
    const sameUsername = await client.db('chatas').collection<UserType>('users').findOne({ username: req.body.username });

    if (sameEmail || sameUsername) {
      const errorMessage = sameEmail
        ? 'Vartotojas su tokiu el. paštu jau egzistuoja.'
        : 'Vartotojas su tokiu slapyvardžiu jau egzistuoja.';
      res.status(409).json({ errorMessage });
      return; // Šis return užbaigia funkciją, todėl next() nebus vykdomas
    }
    next(); // Jei klaidų nėra, vykdoma kita middleware funkcija
  } catch (err) {
    console.error("Klaida patikrinant unikalumą:", err);
    res.status(500).json({ error: 'Serverio klaida' });
  } finally {
    await client.close();
  }
};

// POST užklausa registruojant naują vartotoją
app.post('/api/users', checkUniqueUser, async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const newUser = {
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 10),
      _id: generateID(),
      profileImage: req.body.profileImage || 'default-profile.png'
    };
    await client.db('chatas').collection('users').insertOne(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Klaida kuriant vartotoją:", err);
    res.status(500).json({ error: 'Nepavyko sukurti vartotojo' });
  } finally {
    client.close();
  }
});

// POST užklausa vartotojui prisijungti
app.post('/api/users/login', async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const data = await client.db('chatas').collection<UserType>('users').findOne({ username: req.body.username });
    if (data === null || !bcrypt.compareSync(req.body.password, data.password)) {
      res.status(401).send({ error: 'Neteisingi prisijungimo duomenys.' });
    } else {
      res.send(data);
    }
  } catch (err) {
    console.error("Klaida prisijungimo metu:", err);
    res.status(500).send({ error: err });
  } finally {
    client?.close();
  }
});

// GET užklausa - visi vartotojai
app.get('/api/users', async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const data = await client.db('chatas').collection('users').find().toArray();
    res.send(data);
  } catch (err) {
    res.status(500).send({ error: err });
  } finally {
    client?.close();
  }
});

// DELETE užklausa pašalinti vartotoją
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const id = req.params.id;
    const deletionResponse = await client.db('chatas').collection<UserType>('users').deleteOne({ _id: id });
    res.send(deletionResponse);
  } catch (err) {
    res.status(500).send({ error: err });
  } finally {
    client?.close();
  }
});

// Pagrindinis maršrutas testavimui
app.get('/', (req: Request, res: Response) => {
  res.send('Serveris veikia ir yra paruoštas!');
});

// GET užklausa vienam vartotojui pagal ID
app.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const client = await MongoClient.connect(DB_CONNECTION);

  try {
    const query: Filter<UserType> = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const user = await client.db('chatas').collection<UserType>('users').findOne(query);

    if (!user) {
      res.status(404).send({ error: 'Vartotojas nerastas' });
      return;
    }
    res.status(200).send(user);
  } catch (err) {
    console.error("Klaida gaunant vartotojo duomenis:", err);
    res.status(500).send({ error: 'Serverio klaida gaunant vartotojo duomenis' });
  } finally {
    client?.close();
  }
});

// GET užklausa gauti pranešimus pagal pokalbio ID
app.get('/api/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  if (!conversationId || !ObjectId.isValid(conversationId)) {
    res.status(400).json({ error: 'Invalid or missing conversationId' });
  }

  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const messages = await client.db('chatas').collection('messages').find({ conversationId: new ObjectId(conversationId) }).toArray();
    res.json(messages || []);
  } catch (error) {
    console.error("Klaida gaunant žinutes:", error);
    res.status(500).json({ error: 'Serverio klaida gaunant žinutes' });
  } finally {
    client.close();
  }
});

// Naujo pokalbio pradėjimas tarp dviejų vartotojų
app.post('/api/conversations', async (req: Request, res: Response) => {
  const { user1Id, user2Id } = req.body;

  if (!user1Id || !user2Id) {
     res.status(400).json({ error: "Neteisingi vartotojų ID" });
  }

  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const newConversation = {
      _id: new ObjectId(),
      participants: [user1Id, user2Id],
      createdAt: new Date(),
    };

    const result = await client.db('chatas').collection('conversations').insertOne(newConversation);
    res.status(201).json({ conversationId: result.insertedId });
  } catch (err) {
    console.error("Klaida kuriant pokalbį:", err);
    res.status(500).json({ error: 'Nepavyko pradėti pokalbio' });
  } finally {
    client.close();
  }
});

// POST užklausa įdėti žinutę
app.post('/api/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { senderId, content } = req.body;
  
  if (!conversationId || !ObjectId.isValid(conversationId)) {
    res.status(400).json({ error: 'Invalid conversationId' });
    return;
  }

  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const message = {
      _id: new ObjectId(),
      conversationId: new ObjectId(conversationId),
      senderId,
      content,
      sentAt: new Date(),
      isRead: false
    };

    await client.db('chatas').collection('messages').insertOne(message);
    res.status(201).json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: 'Failed to send message' });
  } finally {
    client.close();
  }
});

// Like funkcionalumas
app.post('/api/messages/:messageId/like', async (req: Request, res: Response): Promise<void> => {
  const { messageId } = req.params;
  const client = await MongoClient.connect(DB_CONNECTION);

  try {
    if (!ObjectId.isValid(messageId)) {
      res.status(400).json({ error: 'Neteisingas messageId formatas' });
      return;
    }

    const result = await client.db('chatas').collection('messages').updateOne(
      { _id: new ObjectId(messageId) },
      { $set: { liked: true } }
    );

    if (result.modifiedCount === 0) {
      res.status(404).json({ error: 'Message not found or already liked' });
      return;
    }

    res.status(200).json({ success: 'Message liked successfully' });
  } catch (error) {
    console.error("Error liking message:", error);
    res.status(500).json({ error: 'Server error while liking message' });
  } finally {
    client.close();
  }
});

// Nauja užklausa, kad patikrintų, ar pokalbis jau egzistuoja
app.get('/api/conversations/check', async (req: Request, res: Response) => {
  const { user1Id, user2Id } = req.query;

  if (!user1Id || !user2Id) {
    res.status(400).json({ error: "Vartotojo ID nėra tinkamo formato." });
    return;
  }

  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const conversation = await client.db('chatas').collection('conversations').findOne({
      participants: { $all: [user1Id, user2Id] }
    });

    if (conversation) {
      res.json({ conversationId: conversation._id });
    } else {
      res.status(404).json({ error: "Pokalbis nerastas" });
    }
  } catch (err) {
    console.error("Klaida tikrinant pokalbį:", err);
    res.status(500).json({ error: "Serverio klaida" });
  } finally {
    client.close();
  }
});

// Pokalbių pagal vartotojo ID gavimas
app.get('/api/conversations/:userId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const client = await prisijungtiPrieDB();

  try {
    const query = ObjectId.isValid(userId) ? { participants: new ObjectId(userId) } : { participants: userId };

    const conversations = await client
      .db('chatas')
      .collection('conversations')
      .find(query)
      .toArray();

    // Jei pokalbių nėra, grąžiname tuščią sąrašą vietoj klaidos
    if (!conversations || conversations.length === 0) {
      res.status(200).json([]);
    } else {
      res.status(200).json(conversations);
    }
  } catch (error) {
    next(error); // Pateikiame klaidą klaidų tvarkytuvui
  } finally {
    client.close();
  }
});

// DELETE užklausa - pašalinti pokalbį
app.delete('/api/conversations/:conversationId', async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const client = await MongoClient.connect(DB_CONNECTION);

  try {
    if (!ObjectId.isValid(conversationId)) {
      res.status(400).json({ error: 'Neteisingas conversationId formatas' });
    }

    const result = await client.db('chatas').collection('conversations').deleteOne({ _id: new ObjectId(conversationId) });
    res.status(result.deletedCount === 0 ? 404 : 200).json(result.deletedCount === 0 ? { error: 'Pokalbis nerastas' } : { success: 'Pokalbis ištrintas' });
  } catch (error) {
    console.error("Klaida trynimo metu:", error);
    res.status(500).json({ error: 'Serverio klaida trynimo metu' });
  } finally {
    client.close();
  }
});

// Naujas maršrutas - gauti pokalbius su neperskaitytų žinučių informacija pagal vartotojo ID
app.get('/api/conversations/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const client = await MongoClient.connect(DB_CONNECTION);

  try {
    console.log("Gaunami pokalbiai su neperskaitytomis žinutėmis vartotojui:", userId);
     const query = ObjectId.isValid(userId) ? { participants: new ObjectId(userId) } : { participants: userId };

     const conversations = await client
        .db('chatas')
        .collection('conversations')
        .aggregate([
           { $match: query },
           {
              $lookup: {
                 from: 'messages',
                 localField: '_id',
                 foreignField: 'conversationId',
                 as: 'messages'
              }
           },
           {
              $addFields: {
                 hasUnreadMessages: {
                    $gt: [
                       {
                          $size: {
                             $filter: {
                                input: "$messages",
                                as: "msg",
                                cond: {
                                   $and: [
                                      { $eq: ["$$msg.isRead", false] }, // Tikriname, ar žinutė neperskaityta
                                      { $ne: ["$$msg.senderId", userId] } // Tikriname, ar žinutė nebuvo išsiųsta paties vartotojo
                                   ]
                                }
                             }
                          }
                       },
                       0
                    ]
                 }
              }
           },
           { $project: { messages: 0 } } // Nepersiunčiame visų žinučių į priekį
        ])
        .toArray();

        console.log("Agregacijos rezultatas (pokalbiai su `hasUnreadMessages`):", conversations);
        
     if (conversations.length === 0) {
        res.status(404).json({ error: 'Pokalbiai nerasti' });
     }

     res.status(200).json(conversations);
  } catch (error) {
     console.error("Klaida gaunant pokalbius:", error);
     res.status(500).json({ error: 'Serverio klaida gaunant pokalbius' });
  } finally {
     client.close();
  }
});

// Ar peržiūrėjo žinutes
app.patch('/api/conversations/:conversationId/markAsRead', async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  if (!conversationId || !ObjectId.isValid(conversationId)) {
    res.status(400).json({ error: 'Invalid or missing conversationId' });
    return;
  }

  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const result = await client.db('chatas').collection('messages').updateMany(
      {
        conversationId: new ObjectId(conversationId),
        senderId: { $ne: userId },
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Žinutės pažymėtos kaip perskaitytos' });
  } catch (error) {
    console.error("Klaida pažymint žinutes kaip perskaitytas:", error);
    res.status(500).json({ error: 'Klaida pažymint žinutes kaip perskaitytas' });
  } finally {
    client.close();
  }
});

// Patikrinkite, ar pokalbis egzistuoja arba sukurkite naują
app.post('/api/conversations/check-or-create', async (req: Request, res: Response) => {
  const { user1Id, user2Id } = req.body;
  const client = await MongoClient.connect(DB_CONNECTION);

  try {
    if (!user1Id || !user2Id) {
      res.status(400).json({ error: 'Trūksta vartotojų ID' });
      return;
    }

    const conversation = await client.db('chatas').collection('conversations').findOne({
      participants: { $all: [user1Id, user2Id] }
    });

    if (conversation) {
      res.status(200).json({ conversationId: conversation._id });
    } else {
      const newConversation = {
        _id: new ObjectId(),
        participants: [user1Id, user2Id],
        createdAt: new Date(),
      };

      const result = await client.db('chatas').collection('conversations').insertOne(newConversation);
      res.status(201).json({ conversationId: result.insertedId });
    }
  } catch (error) {
    console.error("Klaida kuriant/tikrinant pokalbį:", error);
    res.status(500).json({ error: 'Serverio klaida' });
  } finally {
    client.close();
  }
});