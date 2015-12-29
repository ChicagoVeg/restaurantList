#Paths

Yes, admittedly it is not that hard to add a directory to your path in OSX. However there is a bit of work here that can be automated to make adding paths easier.

Thats where paths comes in; it’s a simple script written in nodejs that exposes the path to nodejs and as a simple CLI.

Install via npm

	npm install paths -g

Want to see your $PATH in a more human readable format? Run the following in terminal

	paths

This will return something like this:

	PATHS
	/foo
	/opt/local/bin
	/opt/local/sbin
	/usr/bin
	/bin
	/usr/sbin
	/sbin
	/usr/local/bin
	/usr/X11/bin

If you want to add a path to your ~/.profile

	paths add /foo