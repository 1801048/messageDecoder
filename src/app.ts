const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use((req: any, res: any, next: () => void) => {
  const startTime = new Date();
  const sender = req.header('x-sender');
  const receiver = req.header('x-receiver');

  console.log(`Request received at: ${startTime.toISOString()}`);
  console.log(`Sender: ${sender}, Receiver: ${receiver}`);
  req.startTime = startTime;
  next();
});

const charToNum: Record<string, string> = {
  'a': '2',
  'b': '22',
  'c': '222',
  'd': '3',
  'e': '33',
  'f': '333',
  'g': '4',
  'h': '44',
  'i': '444',
  'j': '5',
  'k': '55',
  'l': '555',
  'm': '6',
  'n': '66',
  'o': '666',
  'p': '7',
  'q': '77',
  'r': '777',
  's': '7777',
  't': '8',
  'u': '88',
  'v': '888',
  'w': '9',
  'x': '99',
  'y': '999',
  'z': '9999',
  ' ': ' '
};

const nokiaMapping :any = {
  '2': ['a', 'b', 'c'],
  '3': ['d', 'e', 'f'],
  '4': ['g', 'h', 'i'],
  '5': ['j', 'k', 'l'],
  '6': ['m', 'n', 'o'],
  '7': ['p', 'q', 'r', 's'],
  '8': ['t', 'u', 'v'],
  '9': ['w', 'x', 'y', 'z'],
  '0': [' '],
};

function convertNokiaToSentence(input :any) {
  const words = input.split(' ');
  let sentence = '';

  for (const word of words) {
    let codes1 = word.match(/(\d)\1*/g);
    let codes=[]
    if (codes1) {
      for (const code1 of codes1) {
        if(code1[0]>=6){
          codes.push(word.match(/(\d)\1{0,2}/g))
        }else{
          codes.push(word.match(/(\d)\1*/g))
        }  
      }
      const len=codes.length
      for (const code of codes[len-1]) {
            if (nokiaMapping[code[0]]) {
              const possibilities = nokiaMapping[code[0]];
              sentence += possibilities[code.length - 1];
            }
         }
    }
    sentence += ' ';
  }

  return sentence.trim();
}

function performTranslation(message:any, sender:any, receiver:any) {
    let translation = '';
  
    for (let i = 0; i < message.length; i++) {
      const char = message[i].toLowerCase();
      const num = charToNum[char];
  
      if (num) {
        if (i > 0 && translation[translation.length - 1] === num[0]) {
          translation += '';
        }
        if (char === ':') {
          translation += ': ';
        } else {
          translation += num;
        }
      }
    }
    return translation;
}


app.use((req:any, res:any, next:any) => {
  const sender = req.header('x-sender');
  const receiver = req.header('x-receiver');

  const originalJson = res.json.bind(res);
  res.json = (data:any) => {
    if (sender === 'earth' && receiver === 'mars') {
      data['Response from Mars'] = performTranslation(data.translatedMessage, sender, receiver);
    } else if (sender === 'mars' && receiver === 'earth') {
      data['Response from Earth'] = convertNokiaToSentence(data.translatedMessage);
    }

    originalJson(data);
  };

  next();
});

app.post('/api/earth-mars-comm/message', (req :any,res:any) => {
  const message = req.body.message;

  if (typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid input. Message must be a string.' });
  }

  const sender = req.header('x-sender');
  const receiver = req.header('x-receiver');

  const endTime = new Date();
  const processingTime = endTime.getTime() - req.startTime.getTime();

  res.json({
    sender,
    receiver,
    translatedMessage: `${message}`,
    processingTime: `${processingTime} ms`
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
