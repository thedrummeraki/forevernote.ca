require 'mail'

class EmailSender

    def self.send_email(to,opts={})
      opts[:address]      ||= 'smtp.gmail.com'
      opts[:port]      ||= 587
      opts[:user_name] ||= 'forevernote.app@gmail.com'
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
end

# send_email "aakin013@uottawa.ca", :body => "This was easy to send"
