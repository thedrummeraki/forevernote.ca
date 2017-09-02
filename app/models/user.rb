require 'openssl'

class User < ApplicationRecord

    serialize :notes
    include ChunkModeler

    def get_email_hash
        return "00000000000000000000000000000000" if self.email_address.strip.to_s.size == 0
        email = self.email_address.to_s.strip
        OpenSSL::Digest::MD5.new(email).to_s
    end

    def get_name
        self.name || self.username
    end

    def create_note
        empty_note = {id: gen_id}
        empty_note[:title] = ""
        self.notes.push empty_note
        {success: self.save, new_id: empty_note[:id]}
    end

    def get_note_pos id
        i = -1
        pos = -1
        get_notes.each do |n|
            if i == -1; i = 0; end
            return i if n[:id] == id
            i += 1
        end
        pos
    end

    def save_note(note, id, get_id=false)
        gen_id id
        pos = self.get_note_pos id
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

    def delete_note(id)
        success = self.notes.reject! {|n| n[:id] == id}
        !success.nil? && self.save
    end

    def find_notes keyword, options={}
        notes = []
        keys = [:id, :contents, :title]
        self.get_built_notes.each do |note|
            keys.each do |key|
                value = note[key]
                next if value.nil?
                if key == :contents
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

    def get_note(id)
        build_chunks id
    end

    def get_note_inst_by_id id
        self.notes.each do |note|
            return note if note[:id] == id
        end
        nil
    end

    def get_note_ids
        ids = []
        self.get_notes.each do |note|
            ids.push note[:id]
        end
        ids
    end

    def get_notes
        if self.notes.nil?
            self.notes = []
            self.save
        end
        notes = self.notes.reject { |n| n[:id].nil? }
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

    def get_built_notes
        notes = []
        self.get_note_ids.each do |note_id|
            notes.push(get_note(note_id))
        end
        notes
    end

    def gen_id id=nil
        id || OpenSSL::Digest::SHA256.new(Time.now.to_s).to_s
    end

    def register
        return false if is_registered?
        self.registration_hash = self.username.to_s + self.email_address.to_s + Time.now.to_s
        self.registration_hash = OpenSSL::Digest::SHA256.new(self.registration_hash)
        self.is_activated = false
        EmailSender.send_registration_email self
        save
    end

    def set_activated
        return true if self.is_activated?
        self.is_activated = true
        save
    end

    def is_registered?
        is_activated? || !self.registration_hash.nil?
    end

    def is_activated?
        !self.is_activated.nil? && self.is_activated == true
    end

    has_secure_password
end
