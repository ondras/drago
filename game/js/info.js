
Game.Info = OZ.Class().implement(Game.IInputHandler);

Game.Info.showWin = function(callback, player) {
	var amount = 2000 + Math.round(Math.random()*8000); /* 2k-10k */
	player.setMoney(player.getMoney() + amount);

	var texts = [
		"I always find it's better to win money than lose it, eh, %s? So does %s put a smile on your face? Well does it??!",
		"Now you're really rocking eh, %s? This blue square is worth a cool %s to you.",
		"Ah. It's great to go on a blues cruise, eh, %s? And with %s into the bargain, whose complaining?",
		"Well, %s, a blue square at last! That means %s. Enjoy it!",
		"Neat stuff, %s! You've landed on a blue square. Extra neat! You win %s as well!",
		"Greetings and salutations, %s! I see you've landed on a blue square. Allow me to allow you %s for your splendid efforts.",
		"Great stuff, %s! I'm sure you can make good use of the %s you've won here, eh?",
		"Now I wonder what brought you to this particular square, %s? Anything to do with the %s you've just won here?",
		"That's what I call luck, %s, landing on this square and collecting %s! Life isn't all bad, eh?",
		"A cunning move, %s! Have an even more cunning %s.",
		"%s &ndash; Take this %s and have a nice day. Now, pocket the dough and get on your way!",
		"As it's you, %s, you can have %s for landing on this blue square. Gosh, I can be so nice when I want to.",
		"Clever move, %s &ndash; take %s as a reward!",
		"%s. You were in the doldrums recently. So you'll get %s to make it better.",
		"Aha I saw that %s, sneaking on to another blue square. Not bad, you can have %s for that."
	];
	
	var text = texts.random();
	text = text.replace("%s", player.getName());
	text = text.replace("%s", Game.formatMoney(amount));
	return new this(callback, "img/reporter.png", text);
}

Game.Info.showLose = function(callback, player, amount) {
	var amount = 4000 + Math.round(Math.random()*11000); /* 4k-15k */
	player.setMoney(player.getMoney() - amount);

	var texts = [
		"Hard cheese, %s! You've landed on a red square, forfeit %s!",
		"I can't believe you really did that, %s? Hand over %s immediately!",
		"Ha.Ha. Caught you out this time, %s! Seeing red will cost you %s!",
		"Now that was a bit dumb, %s! This red square will cost you a pretty packet. You're %s poorer!",
		"I can only suppose you like throwing money around, %s? How else can one explain the %s you've just lost?",
		"Very amusing, %s, but this red square will cost you %s. Still, hope you see the funny side.",
		"You shouldn't really be here y'know, %s? Still, since you are, please can I have %s?",
		"Oh rotten luck %s. What else can I say but: %s please.",
		"Are you trying to get rid of some of your money, %s? Well, you'll lose that %s, if that's what you want!",
		"What on earth are you doing here, %s?  Didn't you realise it would cost you %s?",
		"Now that was very cunning, %s  You've just lost %s.",
		"Bad show, %s! That was a red square y'know. Maybe a %s fine will improve your concentration.",
		"I don't understand your strategy, %s, by moving on to this red square you've just lost %s!",
		"A deeply disappointing move, %s, your account is lighter to the tune of %s."
	];
	
	var text = texts.random();
	text = text.replace("%s", player.getName());
	text = text.replace("%s", Game.formatMoney(amount));
	return new this(callback, "img/reporter.png", text);
}

Game.Info.showCard = function(callback, player) {
	var texts = [
		"Brilliant, %s! Your delightful display is justly rewarded, here, have a card!",
		"I suppose you came here accidently on purpose, %s? You can't fool me y'know, go on, take a card!",
		"A splendid move, %s &ndash; landing on this yellow square means you get a feature card!",
		"Now that was clever, %s. By driving on to this square, you get a card! No, honestly &ndash; I mean that!",
		"Hi %s! Have a card you cad!",
		"Hey, what are you doing on this square, %s? Take a card and be off with you now!",
		"Hi, %s. The cards are over there. Help yourself!",
		"Good squares are blue, yellow squares better! You win a card, %s, 'cause we play by the letter!",
		"Good show, %s, damned good show! You win a feature card!",
		"Hello there, %s. Your expression has 'gimme a card' written all over it. Well OK then, help yourself!",
		"Now be honest with me, %s, do you really think this card will be of any use to you?",
		"Aha, it's %s again! We do keep meeting like this. Well, take a card, and good luck to you!",
		"Oh c'mon don't look at me like that. Take a new card, %s, to cheer yourself up!",
		"Y'know, I think you really deserve a card for that smart move, %s!"
	];
	var text = texts.random();
	text = text.replace("%s", player.getName());
	
	var card = Game.cards.random();
	player.addCard(card);
	
	return new this(callback, "img/cards/" + card.getImage() + ".png", text);
}

Game.Info.showBuy = function(callback, player) {
	var texts = [
		"Hi there, %s! We're open for business &ndash; you can buy some cards if you like!",
		"Got plenty of bread on you, %s? You have? Good, treat yourself to some cards! I kneed the dough.",
		"A purple square, %s &ndash; that means you can buy some cards &ndash; hint hint!",
		"Oh, it's you is it, %s? Well why not buy some cards if you've got the dough?",
		"Been scrimping and saving, %s? I certainly hope so, because this is where you can cash in on some cards!",
		"Roll up, roll up, %s! Welcome to our super, mega, fantastic and quite good card sale!",
		"Hi, %s. Perhaps I can interest you in a few Feature cards?",
		"Well since you're here, %s, perhaps you'd like to buy some of these super cards.",
		"Of course you meant to land on this purple square, %s? Now why not buy some of these excellent cards.",
		"Grab your chance, %s! You can only buy cards on the purple squares! You don't land on 'em every day y'know!",
		"Nice one, %s! If you've got enough change, you can buy some cool cards here. Don't be shy, load up!",
		"Hello, %s. I just know you want to buy some cards! Well, as long as you've got the cash, help yourself!",
		"If you're holding the folding, you can buy some handy Feature cards on this purple square %s. Do it now!",
		"If you've got enough cash, you can buy some great Feature cards on this purple square, %s. Help yourself!"
	];
	var text = texts.random();
	text = text.replace("%s", player.getName());
	
	return new this(callback, "img/reporter.png", text);
}

Game.Info.prototype.init = function(callback, picture, text) {
	this._callback = callback;
	this._node = OZ.DOM.elm("div", {id:"info", position:"absolute"});
	
	var img = OZ.DOM.elm("img", {src:picture});
	this._event = OZ.Event.add(img, "load", this._load.bind(this));
	this._node.appendChild(img);
	
	var p = OZ.DOM.elm("p", {innerHTML:text});
	this._node.appendChild(p);
	
	document.body.appendChild(this._node);
	
	this._border = new Game.Border(this._node);
	
	var win = OZ.DOM.win(true);
	var w = this._node.offsetWidth;
	var h = this._node.offsetHeight;
	this._node.style.left = Math.round((win[0] - w)*0.5) + "px";
	this._node.style.top = Math.round((win[1] - h)*0.3) + "px";

	Game.keyboard.push(this);
}

Game.Info.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ENTER:
		case Game.INPUT_ESC:
			Game.keyboard.pop();
			this._node.parentNode.removeChild(this._node);
			this._callback();
		break;
		default:
			return false;
		break;
	}
	return true;
}

Game.Info.prototype._load = function() {
	this._border.update();
	OZ.Event.remove(this._event);
}
