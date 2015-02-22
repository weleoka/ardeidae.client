<!doctype html>
<html lang='en' class='no-js'>
<head>
    <meta charset=utf-8>
    <title>Ardeidae</title>
    <link rel="shortcut icon" href="favicon.ico">
    <link rel='stylesheet' type='text/css' href='css/normalize.css'>
    <link rel='stylesheet' type='text/css' href='css/boilerplate.css'>
    <link id='activeCss' rel='stylesheet' type='text/css' href='css/style.css'>
    <script src="js/modernizr.js"></script>
</head>
<body>
            <header>
                <button id='disconnect'  class='exitButton'>X</button>
                <div id='status'>no connection</div>
                <h2 id='topbar'>Ardeidae Messenger v2.0</h2>
                <ribbon>First seen 2015!</ribbon>
            </header>

	            <nav>
			<img id="logo" src="img/bird.jpg">
            <button id='botButton' class='smallButton'>BOT</button>
            <button id='stylesheetButton' class='smallButton'>CSS</button>
	            </nav>

    	<section>
                            <article id='createConnection' class='mainPageContainer'>
                            	<button id='refreshButton0' class='smallButton'>Refresh</button>
                            	<button id='refreshButton1' class='smallButton'>Refresh</button>
                            	<button id='refreshButton2' class='smallButton'>Refresh</button>
                            	<div id='welcome'>
<h3>Welcome Ardeidae, a chat-client using websockets</h3>
<p>This is a simple chat service using websockets.</p>
<p>There are different servers to choose from. You can also very easily start your own Ardeidae server. You will just need a web server and node.js installed first!</p>
<p>So with Ardeidae you can have a private chat circle on your local area network, or connect to one of the public or private servers online.</p>
<p>Enjoy!</p>
                    		</div>
                    		<div id='hubList' class="hidden">
                    			<div id="hubListTable">
                    			Searching for active servers on Ardeidae hub... <br> problem with connection.
                    			</div>
                    		</div>
                        	<header>
                                		<h1>Get Connected</h1>
                       	</header>
			    <div id='connectbox'>
			    <div id="serverDA"></div>
			        	 <div id='serverSelectInfo'>
			        	 <input id='serverUrl' class='textInputField' type="text" value='ws://'>
			            </div>
			            <div id='connectInputs'>
				            <input id='userName' class='textInputField' type="text" placeholder="username"><br>
				        	 <input id='password' class='textInputField' type="password" placeholder="password">
				        	 <!-- <input id='eMail' class='textInputField hidden' type="text" placeholder="email"> -->
			        	 </div>
			        <div id='connectbuttonbox'>
			            <button id='connectButton' class='smallButton' value='publicConnect'>Connect</button>
			            <button id='registerButton' class='smallButton'>Register</button>
			            <span id='connectionHandler' class='hidden'></span>
			        </div>
			    </div>
			<footer>
				<h2>on success you will be redirected to message window.</h2>
			</footer>
		</article>

		<article id='createMessage' class='mainPageContainer'>
			<div id='posts'></div>
			<header>
				<h1>Write a message</h1>
			</header>
			    <div id='messagebox'>
			        <form name="message_field">
			            <div id='inputbox'>
			                <textarea id='message' class='textInputField' autofocus></textarea>
			            </div>
			            <div id='buttonbox'>
			                <button id='send' class='smallButton'>Send</button>
			            </div>
			        </form>
			    </div>
			<footer>
				<h2>Your message will be sent by websocket.</h2>
			</footer>
		</article>
	</section>

	<aside>
		<div id='sidecolumn'>
                                  <div id='userCounter'></div>
                                  <div id='serverMetaData'></div>
            		<div id='userList'>
    				<table id="userTable">
    					<thead>
	    					<th>Name</th>
	    					<th>ID</th>
	    					<th><input id="selectAll" type="checkbox"/></th>
    					</thead>
    					<tbody>
					</tbody>
				</table>
            		</div>
			<div id='output'></div>
		</div>
	</aside>

	<footer>
		   Creative Commons Attribution-ShareAlike 4.0 International License.

	</footer>


<script src="js/jquery.min.js"></script>
<!-- <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script> -->
<!-- <script>window.jQuery || document.write('<script src="js/jquery-1.10.1.min.js"></script> IF jQuery did not load from the CDN -->

<script src="js/ardeidae/ardeidaeVariables.js"</script>
<script src="js/ardeidae/ardeidaeFunctions.js"></script>

<script src="js/ardeidae/messageController.js"></script>
<script src="js/ardeidae/viewFeedback.js"></script>
<script src="js/ardeidae/userSimul.js"></script>

<script src="js/ardeidae/main.js"></script>




</body>
</html>

