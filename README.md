# Question Answering Web Extension 

As the amount of online content continues to explode, people need a better way to be more productive and save more time while obtaining online information. Inspiring by the reading and understanding natural language ability of the machine, **Question Answering Web extension** named `HHM’s QA` will be developed to statify the users' needs. With the application, the users can get information from a particular website faster. Specifically, when they are on a website and want to get information from it, they only need to open our application and insert their questions. The extension then parses the web content along with the questions. If the answer is available, it will return it. Thus, the users can retrieve the information they want without reading the entire content. 
## 

## System architecture

There are three main components in the software architecture of our system: web extension, web server, and database server. The user has three ways to interact with the system via the web extension. 
<p align="center">
<img width="611" alt="Screen Shot 2021-06-03 at 00 53 13" src="https://user-images.githubusercontent.com/54904166/120531502-e541a880-c408-11eb-99da-a87509e9d9a3.png">
</p>

Firstly, the user can insert his question(s) to the extension by typing the text input to the UI. After the user hits “Enter,” the extension will process the web content (context) and send it along with the inserted question to the prediction service in the webserver. The prediction service then generates the answers based on the received input and sends it back to the extension. The extension uses them to update the UI. 

Secondly, the user can choose to highlight a particular answer displayed in UI by clicking on it. The extension then scrolls the web page to the position of that answer and highlights it.
Finally, the user can rate the best answer for his question by clicking on the “star” beside the answer. The extension then sends the rated one together with the current question and the context URL to the Database server to store. This information serves as user feedback and will be used to improve the performance of the prediction service in the future.  



## Demonstration

<img width="977" alt="Screen Shot 2021-05-26 at 18 41 26" src="https://user-images.githubusercontent.com/54904166/120531729-26d25380-c409-11eb-9814-2ed8fe5b7175.png">

• The QA Extension has correctly predicted two out of three returned answers. The result also indicates that the model is able to understand the relation between "Priyamvada Gopal" and "her" in the context given by the article named "*The ‘free speech’ law will make university debate harder, not easier*". 

• The extension also allows users to rate the best answer by selecting the star button.

## Setup

I. Installation

1/ **Create Locally Trusted SSL Certificates for using in Google Chrome**


**For macOS**
0. Make sure that the computer has installed homebrew, otherwise have a look at the document through this URL https://docs.brew.sh/Installation  for more information.

1. Turn on your Terminal and Install `mkcert` using homebrew

```
brew install mkcert
```

3. Generate and install a local Certificate Authority

```
mkcert -install
```

4. Create a new certificate

```
mkcert -key-file key.oem -cert-file cert.pem localhost
```

**For Windows**
1. Turn on PowerShell or CMD and install `mkcert`
```
mkcert -install
```

2. Make a Certificate Authority (CA). This CA will be saved in local computer.
```
mkcert localhost
```

3. After the command finishes running, two files “localhost.pem” and “localhost-key.pem” are created in the directory where the command is being run.  

Example: C:\Users\your-user-name

4.    Go to the directory of 2 created keys and save them in the new folder named “keys”
Now the path to “localhost.pem” and “localhost-key.pem” is C:\Users\ your-user-name\keys

5.    Finally, open your Chrome browser, paste and go to chrome://flags/
6.    Find hashtag #allow-insecure-localhost or name “Allow invalid certificates for resources loaded from localhost.” and enable it.

2/ **Setup Docker to run the model**

**For macOS**:
1.    Install Docker Desktop https://docs.docker.com/docker-for-mac/install/
2.    Open Docker Desktop
3.    Open Terminal, use this command to start the model.
```
docker run -p 5000:5000 leemii18/serve-model:0.1
```

-    For Windows:
1.    Install Docker https://docs.docker.com/docker-for-windows/install/ 
2.    Open Docker Desktop
3.    Open PowerShell or CMD, use this command to start the model.
```
docker run -p 5000:5000 leemii18/serve-model:0.1
```


3/ **Setup the extension in Google Chrome**

HHM’s QA extension currently can be used on many devices without any requirement about the type or version of operating system. Besides that, the extension is developed based on the JavaScript IPA that Chrome provides, so to install and use it in the most stable way, user’s devices must have Google Chrome browser. Now, the way to install is through the source code provided here: https://github.com/lenguyenminhhuy/qa-web-extension. 

1.    Clone the source code at Github link above.

- Some ways to clone a repository from Github: https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository


- The local directory which is add for cloning the source code must be saved for future use. 
2.    Open Google Chrome browser.


3.    Go to extension setting, there are 2 ways to access extension setting in Google Chrome.
a.    Paste and go to chrome://extensions.
b.    At the top right, click   -> More tools -> Extensions.


4.    Check “Developer mode” at top right of page.


5.    Upload HHM’s QA extension by clicking button “Load unpacked”.

6.    Enter the local directory, which was saved at step 1.

7.    Choose folder “extension” and confirm to load it.



