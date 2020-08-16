using System;
using System.IO;
using SharpCompress.Archive;
using SharpCompress.Archive.Zip;


class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Zipfile: " + args[0]);
        Console.WriteLine("Destination Directory: " + args[1]);
        Console.WriteLine("Password", args[2]);

        string zipPath = args[0];
        string extractDirectory = args[1];
        string password = args[2];

        using (var archive = ZipArchive.Open(zipPath, password))
        {
            foreach (var entry in archive.Entries)
            {
                if (entry.IsDirectory) continue;

                var outputPath = Path.Combine(extractDirectory, entry.Key);
                entry.WriteToFile(outputPath);
            }
        }
    }
}
