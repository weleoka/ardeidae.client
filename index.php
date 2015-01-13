<!doctype html>
<html lang='en' class='no-js'>
<head>
    <meta charset=utf-8>
    <title>HTML5 websockets</title>
    <link rel="shortcut icon" href="img/drop.png">
    <link rel="stylesheet" href="css/bootstrap.css" title="Bootstrap">
    <link rel="stylesheet" href="css/style.css" title="Bootstrap">
    <script src="js/modernizr.js"></script>
</head>
<body>
            <header>
                <div id='status'>
                	no connection
                	<button id='disconnect'>
                		Disconnect
                	</button>
                </div>
                <h2 id='topbar'>Ardeidae Messenger</h2>
                <h4>First seen 2015!</h4>
            </header>

	            <nav>
			<img id="logo" src="img/bird.jpg">
	            </nav>

    	<section>
                            <article id='createConnection'>
                            	<div id='welcome'>
<h3>Welcome to a node.js powered chat-client using websockets</h3>
<p>This is a simple chat service using websockets. Please read the <a href="none">usage rules</a>
and then login and get chatting to others!</p>
<p>There are some different servers to choose from. You can use the included server if you run it with "nodejs"
and then se the chat on your local area network, or connect to one of the public servers online.</p>
<p>Enjoy!</p>
                    		</div>
                        	<header>
                                		<h1>HTML5 websockets</h1>
                       	 </header>
			    <div id='connectbox'>
			        <form name="myform">

			            <select id="dropDown" name="selectServer">
			                <option value="ws://dbwebb.se:1337">Remote</option>
			                <option value="ws://127.0.0.1:1337">Local</option>
			                <option value="ws://192.168.1.36:1337">LAN</option>
			            </select>
			            <input id='url' type="text" name="serverURL" value='ws://dbwebb.se:1337'>
			            <input id='userName' type="text" name="userName" placeholder="username"><br>
			        	<input id='password' type="text" name="password" placeholder="password (if required)">

			        </form>
			        <div id='connectbuttonbox'>
			            <button id='connect'>Connect</button>
			        </div>
			    </div>
			<footer>
				<h2>on success you will be redirected to message window.</h2>
			</footer>
		</article>

		<article id='createMessage'>
			<div id='posts'></div>
			<header>
				<h1>Write a message</h1>
			</header>
			    <div id='messagebox'>
			        <form name="message_field">
			            <div id='inputbox'>
			                <textarea id='message' autofocus></textarea>
			            </div>
			            <div id='buttonbox'>
			                <button id='send'>Send</button>
			            </div>
			        </form>
			    </div>
			<footer>
				<h2>Your message will be sent by websocket.</h2>
			</footer>
		</article>
	</section>

	<aside>
		<div id='userCounter'></div>
		<div id='userlist'></div>
		<div id='output'></div>
	</aside>

	<footer>
		    <i>Content on this site is licensed under the
		    Creative Commons Attribution Share-Alike License v3.0. &copy; 2015</i>
	</footer>

<script src="js/jquery.min.js"></script>
<script src="js/main.js"></script>

</body>
</html>

