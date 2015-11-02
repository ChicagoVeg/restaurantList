<?php
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    $from = 'Chicago Veg Contact Form'; 
    $to = 'info@chicagoveg.com';
    $subject = 'Message from Chicago Veg Contact Form ';
    
    $subject = 'Email Inquiry';

    $body = "From: $name\n E-Mail: $email\n Message:\n $message";
 

 session_start();


if ($_POST['submit']) {
     
    if($_POST['captcha'] != $_SESSION['digit']) { 
        header("Location: contact.htm?name=$name&message=$message&email=$email");
    } else if (mail ($to, $subject, $body, $from)) { 
       header('Location: contactSuccess.htm');
    } else { 
        header('Location: contactError.htm');
    }
}

  session_destroy();
?>