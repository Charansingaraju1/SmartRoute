import subprocess

sql = """
SELECT 'bus_pass_records' as tbl, pass_number, status FROM smartroute.bus_pass_records WHERE pass_number LIKE '%31849762%';
SELECT 'students' as tbl, student_id FROM smartroute.students WHERE student_id LIKE '%31849762%';
"""

cmd = ['mysql', '-u', 'smartroute_app', '-p11b99eab3956625c76e80627fc0b598bbcf283d6', '-e', sql]
res = subprocess.run(cmd, capture_output=True, text=True)
print(res.stdout)
