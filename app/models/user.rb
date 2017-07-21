require 'openssl'

class User < ApplicationRecord

    serialize :notes

    def get_email_hash
        return "00000000000000000000000000000000" if self.email_address.strip.to_s.size == 0
        email = self.email_address.to_s.strip
        OpenSSL::Digest::MD5.new(email).to_s
    end

    def get_name
        self.name || self.username
    end

    def save_note(note, id)
        p "gen id"
        id = id || OpenSSL::Digest::SHA256.new(Time.now.to_s).to_s
        i = -1
        pos = -1
        p "getting notes"
        get_notes.each do |n|
            if i == -1; i = 0; end
            if n[:id] == id
                pos = i
                break
            end
            i += 1
        end
        p "adding/updating note \"#{note}\""
        if note.to_s.strip.size > 0
            if pos == -1
                p "adding"
                self.notes.push({id: id, note: note})
            else
                p "updating"
                self.notes[pos] = {id: id, note: note}
            end
        end
        p "done"
        self.save
    end

    def get_note(id)
        note = nil
        self.get_notes.each do |n|
            return n if n[:id] == id
        end
    end

    def get_notes
        if self.notes.nil?
            self.notes = []
            self.save
        end
        self.notes.reject { |n| n[:note].nil? }
    end

    has_secure_password
end
