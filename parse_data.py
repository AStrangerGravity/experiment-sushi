import random, json, pprint

dataset = "sushi3-2016/sushi3b.5000.10.score"
names = json.loads(open("sushi3-2016/names.txt").read())

# An array of 100-sized arrays
data = []

# Load up the dataset
def load_and_init():


	with open(dataset) as f:
		for line in f.readlines():
			personal_ratings = map(int, line.split(" "))
			data.append(personal_ratings)
			#print len(filter(lambda x: not x == -1, personal_ratings))



def popularvote():
	# popular vote. if multiple max value, just choose randomly
	votes = [0] * 100
	for personal_ratings in data:
		maxval = max(personal_ratings)
		maxindices = [i for i, j in enumerate(personal_ratings) if j == maxval]

		vote = random.choice(maxindices)
		votes[vote] += 1

	print "### Vote counts per item"
	print votes
	sortedvotes_indicesandcounts = sorted(enumerate(votes), key=lambda x: x[1], reverse=True)
	sortedwinners = [i for i, j in sortedvotes_indicesandcounts]

	print "### Winner indices"
	print sortedwinners

	print "### Ranked Winners with votes"
	winner_nameswithvotes = [(names[i], votes[i]) for i in sortedwinners]
	winner_nameswithvotes.reverse()
	pprint.pprint(winner_nameswithvotes)

def approval():
	# 3 or higher is a vote
	approval_cutoff = 2

	# approval vote
	votes = [0] * 100
	for personal_ratings in data:
		maxindices = [i for i, j in enumerate(personal_ratings) if j >= approval_cutoff]

		for vote in maxindices:
			votes[vote] += 1

	print "### Vote counts per item"
	print votes
	sortedvotes_indicesandcounts = sorted(enumerate(votes), key=lambda x: x[1], reverse=True)
	sortedwinners = [i for i, j in sortedvotes_indicesandcounts]

	print "### Winner indices"
	print sortedwinners

	print "### Ranked Winners with votes"
	winner_nameswithvotes = [(names[i], votes[i]) for i in sortedwinners]
	winner_nameswithvotes.reverse()
	pprint.pprint(winner_nameswithvotes)

load_and_init()
approval()
