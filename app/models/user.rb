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

    def save_note(note, id, get_id=false)
        p "gen id"
        id = id || OpenSSL::Digest::SHA256.new(Time.now.to_s).to_s
        i = -1
        pos = -1
        get_notes.each do |n|
            if i == -1; i = 0; end
            if n[:id] == id
                pos = i
                break
            end
            i += 1
        end
        if note.to_s.strip.size > 0
            if pos == -1
                self.notes.push({id: id, note: note})
            else
                self.notes[pos] = {id: id, note: note}
            end
        end
        res = self.save
        if get_id 
            return nil unless res
            return id
        else
            res
        end
    end

    def append_note(note, id, get_id=false)
        return true if note.to_s.empty?
        i = -1
        pos = -1
        get_notes.each do |n|
            if i == -1; i = 0; end
            if n[:id] == id
                pos = i
                break
            end
            i += 1
        end
        return (get_id ? nil : false) if pos == -1
        current_note = self.get_note(id)
        p "Current note size: #{current_note[:note].to_s.size}"
        p "Note to append size: #{note.to_s.size}"
        new_note = current_note[:note].to_s + note.to_s
        p "New note size: #{new_note.size}"
        self.notes[pos] = {id: id, note: new_note}
        get_id ? id : self.save
    end

    def set_note_title(id, title)
        i = -1
        pos = -1
        get_notes.each do |n|
            if i == -1; i = 0; end
            if n[:id] == id
                pos = i
                break
            end
            i += 1
        end
        return false if pos == -1
        self.notes[pos][:title] = title
        self.save
    end

    def get_note(id)
        note = nil
        self.get_notes.each do |n|
            return n if n[:id] == id
        end
        nil
    end

    def delete_note(id)
        success = self.notes.reject! {|n| n[:id] == id}
        !success.nil? && self.save
    end

    def find_notes keyword, options={}
        notes = []
        keys = [:id, :note, :title]
        self.get_notes.each do |note|
            keys.each do |key|
                value = note[key]
                if key == :note
                    value = Base64.decode64(value) if options[:b64]
                    value = URI.unescape(value) if options[:uri]
                end
                begin
                    if value.downcase.include? keyword.downcase
                        notes.push(note)
                    end
                rescue Encoding::CompatibilityError
                end
            end
        end
        notes
    end

    def get_notes
        if self.notes.nil?
            self.notes = []
            self.save
        end
        notes = self.notes.reject { |n| n[:note].nil? }
        #res = []
        #notes.each do |note|
        #    contnt = note[:note]
        #    begin
                #contnt = Base64.decode64 contnt
                #contnt = URI.unescape contnt
        #        note[:note] = contnt
        #    rescue Exception => e
        #    end
        #    res.push note
        #end
        #res
    end

    has_secure_password
end
