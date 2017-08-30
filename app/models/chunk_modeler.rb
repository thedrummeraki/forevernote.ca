module ChunkModeler

    def save_chunk text, id, idx, get_id=false
        # Initialize the note object.
        note = self.get_note id
        return (get_id ? nil : false) if note.nil?

        # Initialize the chunks array and create a new one if needed.
        note[:chunks] = [] if note[:chunks].nil?
        chunks = note[:chunks]
        note[:chunks] = chunks

        # Check if the index exists, and stop if it does. Create a chunk object.
        unless chunks_exists id, idx
            chunk = {pos: idx, content: text}
            note[:chunks].push chunk

            # Now update the note.
            pos = self.get_note_pos id
            unless pos < 0
                self.notes[pos] = note
            else
                self.notes.push note
            end
            res = self.save
        else
            # Avoid a useless save
            res = true
        end

        # And save the note on the database and return the result.
        if get_id
            return nil unless res
            return id
        else
            res
        end
    end

    def chunks_exists id, idx
        note = self.get_note id
        return false if note.nil?
        chunks = note[:chunks]
        return false if chunks.class != Array
        chunks.each do |chunk|
            return true if chunk[:pos] == idx
        end
        return false
    end

    def build_chunks id
        # Get all chunks
        note = self.get_note id
        return nil if note.nil?
        chunks = note[:chunks]
        return nil if chunks.class != Array

        # Sort all chunks by position
        chunks = chunks.sort_by{|chunk| chunk[:pos]}
        text = ""
        chunks.each do |chunk|
            next if chunk[:content].nil?
            text << chunk[:content]
        end
        {contents: text, id: id, title: note[:title]}
    end

end