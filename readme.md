## Time Control

Time control is based in Laravel web application framework.

Laravel Docs: https://laravel.com/docs/6.x

## Requirements

    PHP >= 7.1.3
        BCMath PHP Extension
        Ctype PHP Extension
        JSON PHP Extension
        Mbstring PHP Extension
        OpenSSL PHP Extension
        PDO PHP Extension
        Tokenizer PHP Extension
        XML PHP Extension
    PHP Composer
    Apache/Other web servers with php support
    MySql Server

## Installation

    git clone git@gitlab.networks.imdea.org:manuel_herrera/time-control.git
    cd time-control
    composer install
    cp .env.example .env

Configure .env file with your server passwords    

    php artisan migrate
    
WARNING: After migration take care to the console because it will show the master user/password
to access the first time to the app and create more users

Now you can create an apache website looking for

    time-control/public
    
public folder contains the php and .htaccess files prepared to run the application

Or for develop you can run the application with the command

    php artisan serv
    
If your want to generate fake data

    php artisan fake:data
    
Note: Every fake data execution will generate a supervisor with 8-22 employee with 1 year history records from 01/01/2019 to 04/10/2019

To regenerate database (drop everything and make every table and the master account again)

    php artisan migrate:rollback
    php artisan migrate
