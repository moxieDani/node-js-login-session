# node-js-login-session
This is the test for the login session of node.js.

## Before start..
1. If you don\`t have any mysql database, go to your preferences and open MySQL Server pererence. Click on `Start MySQL Server`.
	-  To make a Databse, do the following
		~~~
		bash $ mysql -u root -h 127.0.0.1 -p1234 # enter the temporary 
		~~~

	- If you want to change the password of root user, please refer to this.
		~~~
		mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'new-password';
		~~~

	- Create Databse
		~~~
		mysql> CREATE DATABASE node_js_login_session character set UTF8 collate utf8_bin;
		~~~

	- Use Database
		~~~
		mysql> USE node_js_login_session;
		~~~

2. Copy & paste below DDLs on the your database command window.
	- Create User Table.
		~~~
		CREATE TABLE `user` ( `no` int(10) NOT NULL AUTO_INCREMENT, `id` varchar(30) DEFAULT NULL, `passwd` varchar(80) NOT NULL, `auth_codes` varchar(20) NOT NULL, `mail` varchar(80) NOT NULL, `regist_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`no`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
		~~~
	- Insert few Users.
		~~~
		INSERT INTO user(id, passwd, auth_codes, mail) VALUES('daniel.kwon', '1234', 'SA,SM,AM,TA,SE', 'daniel.kwon@test.email');
		~~~
		~~~
		INSERT INTO user(id, passwd, auth_codes, mail) VALUES('derrick.kang', '1234', 'SE', 'derrick.kang@test.email');
		~~~

## Run
~~~
node ./bin/www
~~~