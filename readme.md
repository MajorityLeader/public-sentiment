# public sentiment express framework

this framework is an expressjs server which features:

* the ability to accept public feedback through endorsement/opposition of a particular piece of legislation
* public comments on the legislation
* filter comments for any profanity, and also score comments based on their sentiment using a third-party API
* invisibly prevent spamming of endorsements and comments using v3 of Google reCaptcha
* forward public comments to their respective memebers of congress
* display public sentiment on a map by district/city

## Getting started
### SQL structure
This framework uses Sequelize to manage it's data backend: https://sequelize.org//. Tables can automatically be created
using Sequelize's Model synchronization: https://sequelize.org/master/manual/model-basics.html

### .env variables
Environment variables should include the following. Refer to code for their use:
```
NODE_ENV=[development | production]

MYSQL_HOST=[127.0.0.1]
MYSQL_USER=[root]
MYSQL_PASSWORD=[password]

CAPTCHA_SECRET_KEY=[Google reCaptcha API secret key]
CAPTCHA_CLIENT_KEY=[Google reCaptcha API public key]

CWC_KEY=[Communicating with congress key, issued by House] see: https://www.house.gov/doing-business-with-the-house/communicating-with-congress-cwc

GOOGLE_KEY=[Google API key for rendering maps or looking up district reps for a given address]

ADMIN_KEY=[any unique admin key for admin router endpoints]
```
