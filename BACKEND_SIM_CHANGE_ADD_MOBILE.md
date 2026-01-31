# Backend: Show user email & mobile in sim_change_events

So you can see **who** (email / mobile) each SIM change belongs to without joining the users table.

---

## 1. Add columns to the entity

In your **SimChangeEvent.java** (or equivalent), add two fields and getters/setters:

```java
@Column(name = "user_email", length = 255)
private String userEmail;

@Column(name = "user_mobile", length = 50)
private String userMobile;

// getters and setters for userEmail and userMobile
```

---

## 2. Create the new columns in the database

Run this SQL once (adjust table/column names if yours differ):

```sql
ALTER TABLE sim_change_events
  ADD COLUMN user_email VARCHAR(255),
  ADD COLUMN user_mobile VARCHAR(50);
```

If you use Hibernate with `ddl-auto=update`, it can add the columns for you after you add the fields to the entity.

---

## 3. Populate them when saving

In your **SimChangeService**, when you record the event, you need the **User** (or at least email + mobile). Two options:

**Option A – Service receives userId and you load User**

Inject your User repository/service and set email/mobile when saving:

```java
@Service
public class SimChangeService {

    private final SimChangeEventRepository simChangeEventRepository;
    private final UserRepository userRepository;  // or UserService

    public SimChangeService(SimChangeEventRepository simChangeEventRepository,
                            UserRepository userRepository) {
        this.simChangeEventRepository = simChangeEventRepository;
        this.userRepository = userRepository;
    }

    public void recordSimChange(Long userId, String previousFingerprint, String currentFingerprint) {
        // ... existing log ...

        User user = userRepository.findById(userId).orElse(null);

        SimChangeEvent event = new SimChangeEvent();
        event.setUserId(userId);
        event.setPreviousFingerprint(previousFingerprint);
        event.setCurrentFingerprint(currentFingerprint);
        event.setDetectedAt(LocalDateTime.now());
        if (user != null) {
            event.setUserEmail(user.getEmail());        // use your User's email field name
            event.setUserMobile(user.getPhoneNumber()); // use your User's phone field name
        }
        simChangeEventRepository.save(event);
    }
}
```

**Option B – Controller already has User**

If your controller loads the User (e.g. by email from principal), pass email and mobile into the service:

```java
// In controller:
simChangeService.recordSimChange(user.getId(), user.getEmail(), user.getPhoneNumber(),
    request.getPreviousFingerprint(), request.getCurrentFingerprint());

// In service:
public void recordSimChange(Long userId, String userEmail, String userMobile,
                            String previousFingerprint, String currentFingerprint) {
    // ...
    event.setUserId(userId);
    event.setUserEmail(userEmail);
    event.setUserMobile(userMobile);
    event.setPreviousFingerprint(previousFingerprint);
    event.setCurrentFingerprint(currentFingerprint);
    event.setDetectedAt(LocalDateTime.now());
    simChangeEventRepository.save(event);
}
```

Use the field names that match your **User** model (e.g. `getPhoneNumber()`, `getMobile()`, `getEmail()`).

---

## 4. Result

After this, a row will look like:

| id | user_id | user_email | user_mobile | previous_fingerprint | current_fingerprint | detected_at |
|----|---------|------------|-------------|----------------------|---------------------|-------------|
| 1  | 1       | shashikumarkushwaha3@gmail.com | +919876543210 | TEST_FAKE\|000\|000 | Jio\|405\|856 | 2026-01-31 22:47:43 |

So you can see the **mobile number** (and email) directly in the table.
