require 'mail'

class EmailSender

    FOREVERNOTE_EMAIL = 'forevernote.app@gmail.com'

    def self.send_email(to,opts={})
      opts[:address]      ||= 'smtp.gmail.com'
      opts[:port]      ||= 587
      opts[:user_name] ||= FOREVERNOTE_EMAIL
      opts[:password] ||= ENV["EMAIL_PASS"]
      opts[:authentication] ||= "plain"
      opts[:enable_starttls_auto] ||= true
      opts[:subject] ||= 'ForeverNote Notification'

      Mail.defaults do
        delivery_method :smtp, opts
      end

      Mail.deliver do
         to to
         from 'ForeverNote App'
         subject opts[:subject]
         html_part do
            content_type 'text/html; charset=UTF-8'
            body opts[:body]
         end
      end
    end

    def self.send_registration_email user
      activation_link = 'https://www.forevernote.ca/activate/' + user.username
      html = [
        '<h2>Welcome to ForeverNote!</h2>',
        '<p>',
          "Hello, #{user.get_name} and welcome to ForeverNote! You are reading this ",
          "email because, you have registered using the email address ",
          '<a href=\'' + user.email_address + '\'>',
          user.email_address,
          '</a>. If this is not you, you can simply ignore this email.',
          '<br/>',
          '<br/>',
          'If this is you, then please click on the link below to activate your account:',
          '<br>',
          '<br>',
          '<a href="'+ activation_link + '">' + activation_link + '</a>.',
          '<br>',
          '<br>',
          'Thank you and have a good day,',
          '<p>ForeverNote (<a href="mailto:' + FOREVERNOTE_EMAIL + '">' + FOREVERNOTE_EMAIL + '</a>)',
        '<p>'
      ]
      html = html.join ''
      send_email(user.email_address, body: html, subject: 'ForeverNote - Welcome')
    end
end

# send_email "aakin013@uottawa.ca", :body => "This was easy to send"
