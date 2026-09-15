import java.io.*;
import java.util.*;
import java.util.regex.*;

/**
 * StudentRegistry
 *
 * A small console program to register students (name, USN, email)
 * and store them in students.txt as comma-separated values:
 *   Name,USN,Email
 *
 * The first line of students.txt is treated as a header and is
 * skipped when loading existing records.
 *
 * Usage:
 *   javac StudentRegistry.java
 *   java StudentRegistry
 */
public class StudentRegistry {

    private static final String DATA_FILE = "students.txt";
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    // Simple in-memory record of a student
    static class Student {
        String name;
        String usn;
        String email;

        Student(String name, String usn, String email) {
            this.name = name;
            this.usn = usn;
            this.email = email;
        }

        String toCsvLine() {
            return escape(name) + "," + escape(usn) + "," + escape(email);
        }

        // Wrap a field in quotes if it contains a comma or quote
        private static String escape(String field) {
            if (field.contains(",") || field.contains("\"")) {
                return "\"" + field.replace("\"", "\"\"") + "\"";
            }
            return field;
        }
    }

    private final List<Student> students = new ArrayList<>();
    private final Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        StudentRegistry app = new StudentRegistry();
        app.loadFromFile();
        app.runMenu();
    }

    private void runMenu() {
        boolean running = true;
        while (running) {
            System.out.println();
            System.out.println("==== Student Registry ====");
            System.out.println("1. Add student");
            System.out.println("2. View all students");
            System.out.println("3. Search students");
            System.out.println("4. Remove a student (by USN)");
            System.out.println("5. Exit");
            System.out.print("Choose an option: ");

            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    addStudent();
                    break;
                case "2":
                    viewAll();
                    break;
                case "3":
                    search();
                    break;
                case "4":
                    removeStudent();
                    break;
                case "5":
                    running = false;
                    System.out.println("Goodbye.");
                    break;
                default:
                    System.out.println("That's not a valid option, try again.");
            }
        }
    }

    private void addStudent() {
        System.out.print("Full name: ");
        String name = scanner.nextLine().trim();
        if (name.isEmpty()) {
            System.out.println("Name can't be empty. Not added.");
            return;
        }

        System.out.print("USN: ");
        String usn = scanner.nextLine().trim().toUpperCase();
        if (usn.isEmpty()) {
            System.out.println("USN can't be empty. Not added.");
            return;
        }
        if (findByUsn(usn) != null) {
            System.out.println("A student with USN " + usn + " is already registered. Not added.");
            return;
        }

        System.out.print("Email: ");
        String email = scanner.nextLine().trim();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            System.out.println("That email doesn't look valid. Not added.");
            return;
        }

        Student s = new Student(name, usn, email);
        students.add(s);
        appendToFile(s);
        System.out.println("Added " + name + " (" + usn + ").");
    }

    private void viewAll() {
        if (students.isEmpty()) {
            System.out.println("No students registered yet.");
            return;
        }
        System.out.println();
        System.out.printf("%-25s %-15s %-30s%n", "Name", "USN", "Email");
        System.out.println("-".repeat(70));
        for (Student s : students) {
            System.out.printf("%-25s %-15s %-30s%n", s.name, s.usn, s.email);
        }
        System.out.println();
        System.out.println("Total: " + students.size());
    }

    private void search() {
        System.out.print("Search by name, USN, or email: ");
        String query = scanner.nextLine().trim().toLowerCase();
        List<Student> matches = new ArrayList<>();
        for (Student s : students) {
            if (s.name.toLowerCase().contains(query)
                    || s.usn.toLowerCase().contains(query)
                    || s.email.toLowerCase().contains(query)) {
                matches.add(s);
            }
        }
        if (matches.isEmpty()) {
            System.out.println("No matches found.");
            return;
        }
        System.out.printf("%-25s %-15s %-30s%n", "Name", "USN", "Email");
        System.out.println("-".repeat(70));
        for (Student s : matches) {
            System.out.printf("%-25s %-15s %-30s%n", s.name, s.usn, s.email);
        }
    }

    private void removeStudent() {
        System.out.print("Enter the USN to remove: ");
        String usn = scanner.nextLine().trim().toUpperCase();
        Student found = findByUsn(usn);
        if (found == null) {
            System.out.println("No student with that USN.");
            return;
        }
        students.remove(found);
        rewriteFile();
        System.out.println("Removed " + found.name + " (" + usn + ").");
    }

    private Student findByUsn(String usn) {
        for (Student s : students) {
            if (s.usn.equalsIgnoreCase(usn)) {
                return s;
            }
        }
        return null;
    }

    // ---- File I/O ----

    private void loadFromFile() {
        File file = new File(DATA_FILE);
        if (!file.exists()) {
            return;
        }
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    if (line.toLowerCase().startsWith("name,usn,email")) {
                        continue; // skip header
                    }
                }
                if (line.isBlank()) continue;
                String[] parts = splitCsvLine(line);
                if (parts.length == 3) {
                    students.add(new Student(parts[0], parts[1], parts[2]));
                }
            }
            System.out.println("Loaded " + students.size() + " existing student(s) from " + DATA_FILE + ".");
        } catch (IOException e) {
            System.out.println("Couldn't read " + DATA_FILE + ": " + e.getMessage());
        }
    }

    private void appendToFile(Student s) {
        boolean needsHeader = !new File(DATA_FILE).exists();
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(DATA_FILE, true))) {
            if (needsHeader) {
                writer.write("Name,USN,Email");
                writer.newLine();
            }
            writer.write(s.toCsvLine());
            writer.newLine();
        } catch (IOException e) {
            System.out.println("Couldn't save to " + DATA_FILE + ": " + e.getMessage());
        }
    }

    private void rewriteFile() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(DATA_FILE, false))) {
            writer.write("Name,USN,Email");
            writer.newLine();
            for (Student s : students) {
                writer.write(s.toCsvLine());
                writer.newLine();
            }
        } catch (IOException e) {
            System.out.println("Couldn't update " + DATA_FILE + ": " + e.getMessage());
        }
    }

    // Minimal CSV line splitter that handles quoted fields with embedded commas
    private String[] splitCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        current.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current.append(c);
                }
            } else {
                if (c == '"') {
                    inQuotes = true;
                } else if (c == ',') {
                    fields.add(current.toString());
                    current.setLength(0);
                } else {
                    current.append(c);
                }
            }
        }
        fields.add(current.toString());
        return fields.toArray(new String[0]);
    }
}
