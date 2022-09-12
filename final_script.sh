#!/bin/bash

# Am i Root user?
if [ $(id -u) -eq 0 ]; then
    echo "Installing Python"
    sudo apt update && sudo apt upgrade -y
    sudo apt update
    sudo apt install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev
    sudo apt-get install wget
    wget  https://www.python.org/ftp/python/3.10.5/Python-3.10.5.tgz
    tar -xf Python-3.10.5.tgz
    ./configure --enable-optimizations
    $NPROC=$(nproc)
    make -j $NPROC
    sudo make altinstall
    python3.10 --version

    echo 'installing pip'
    sudo apt update
    yes | sudo apt install python3-pip
    pip3 --version

    echo 'installing MySQL'
    sudo apt update
    yes | sudo apt install mysql-server
    sudo systemctl start mysql.service
    # sudo mysql_secure_installation
    
    echo 'configuring mysql'
    #password for mysql
    PASSWDDB="1234"
    #username and database name for mysql
    MAINDB='raspberry'
    sudo mysql -e "CREATE DATABASE ${MAINDB} /*\!40100 DEFAULT CHARACTER SET utf8 */;"
    sudo mysql -e "CREATE USER ${MAINDB}@localhost IDENTIFIED BY '${PASSWDDB}';"
    sudo mysql -e "GRANT ALL PRIVILEGES ON ${MAINDB}.* TO '${MAINDB}'@'localhost';"
    sudo mysql -e "FLUSH PRIVILEGES;"
    # sudo mysql -u ${MAINDB} -p${PASSWDDB} -D $MAINDB{} -e "SELECT * FROM ${MAINDB};"

    #redis installation
    echo 'Installing Redis'
    sudo apt update
    yes | sudo apt install redis-server

    #project setup
    echo 'Downloading Raspberry Project'
    sudo mkdir raspberry_project
    cd raspberry_project
    # pip3.10 install virtualenv
    yes | sudo apt install python3.10-venv
    python3.10 -m venv env
    source env/bin/activate
    yes | sudo apt-get install libmysqlclient-dev
    pip3.10 install Django==4.0.5 redis==4.3.4 mysqlclient==2.1.1 python-dotenv==0.20.0
    #git clone command in future but for now manual download zip file
    cd raspberry
    python3.10 manage.py makemigrations
    python3.10 manage.py migrate
    python3.10 manage.py runserver

    echo 'Finished all the installtion'            
else
	echo "Only root may add a user to the system."
	exit 2
fi



