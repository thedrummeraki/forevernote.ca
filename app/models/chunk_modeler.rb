module ChunkModeler

    # Note object model
    # note: {
    #     id: "string",
    #     title: "string",
    #     chunks: [
    #        {pos: integer,
    #         content: "string"},
    #     ]
    # }   

    def save_chunk text, id, idx, get_id=false
        # Initialize the note object.
        note = self.get_note_inst_by_id id
        return (get_id ? nil : false) if note.nil?

        # Initialize the chunks array and create a new one if needed.
        note[:chunks] = [] if note[:chunks].nil?
        chunks = note[:chunks]

        save_necessary = compare_sent_chunk_with_existing text, idx, id
        p "Saving necessary for chunk number #{idx}? #{save_necessary}"

        # Return true if the current chunk has not been changed.
        return (get_id ? id : true) unless save_necessary

        # Create a chunk object.
        chunk = {pos: idx, content: text}
        p "Adding #{text.size} byte(s) of text at position #{idx} for note id #{id}"
        note[:chunks].push chunk

        # Now update the note.
        pos = self.get_note_pos id
        unless pos < 0
            self.notes[pos] = note
        else
            self.notes.push note
        end
        res = self.save
        p "chunks = \"#{note[:chunks]}\""

        # And save the note on the database and return the result.
        if get_id
            return nil unless res
            return id
        else
            res
        end
    end

    def compare_sent_chunk_with_existing text, idx, id
        note = get_note_inst_by_id id
        p "compare_sent_chunk_with_existing: nil?"
        return false if note.nil?
        chunks = note[:chunks]
        p "compare_sent_chunk_with_existing: Array?"
        return true if chunks.class != Array
        chunks.each do |chunk|
            p "compare_sent_chunk_with_existing: #{chunk[:content]} VS #{text} | #{idx} VS #{chunk[:pos]}"
            return true if chunk[:content] != text && idx == chunk[:pos]
        end
        return chunks.empty?
    end

    def chunks_exists id, idx
        note = self.get_note_inst_by_id id
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
        note = self.get_note_inst_by_id id
        return nil if note.nil?
        chunks = note[:chunks]
        return {contents: '', id: id, text: note[:title]} if chunks.class != Array

        # Sort all chunks by position
        chunks = chunks.sort_by{|chunk| chunk[:pos]}
        text = ""
        chunks.each do |chunk|
            next if chunk[:content].nil?
            text << chunk[:content]
        end
        {contents: text, id: id, title: note[:title]}
    end

    def is_empty_note id
        note = self.get_note id
        return true if note.nil?
        is_empty = true
        [note[:contents], note[:title]].each do |string|
            if !string.to_s.strip.empty?
                is_empty = false
                break
            end
        end
        is_empty
    end

end