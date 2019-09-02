import java.io.*;
import java.stream.*;

public class Main {
	public static void main(String... args) {
		File dir = new File("./");
		StringBuilder jsonStr="{";
		Boolean first=true;
		for(String fileName : dir.list()) {
			if(!first) jsonStr.append(","); 
			first=false;
			String rawPts = new String(Files.readAllBytes(Paths.get("./"+fileName)));
			List<String> rawPtsList = Stream.of(rawPts.split("\n"));
			
			break;
		}


	}
}